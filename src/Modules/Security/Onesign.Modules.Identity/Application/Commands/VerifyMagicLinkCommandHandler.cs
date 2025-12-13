using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;
using System.Security.Cryptography;

namespace Onesign.Modules.Identity.Application.Commands;

public class VerifyMagicLinkCommandHandler : IRequestHandler<VerifyMagicLinkCommand, Result<LoginResponse>>
{
    private readonly IMagicLinkTokenRepository _magicLinkTokenRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IAuthService _authService;
    private readonly IUserLoginSessionRepository _userLoginSessionRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<VerifyMagicLinkCommandHandler> _logger;

    public VerifyMagicLinkCommandHandler(
        IMagicLinkTokenRepository magicLinkTokenRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IAuthService authService,
        IUserLoginSessionRepository userLoginSessionRepository,
        IMediator mediator,
        ILogger<VerifyMagicLinkCommandHandler> logger)
    {
        _magicLinkTokenRepository = magicLinkTokenRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _authService = authService;
        _userLoginSessionRepository = userLoginSessionRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<LoginResponse>> Handle(VerifyMagicLinkCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Magic link verification attempt for token: {Token}", request.Token);

        var magicLinkToken = await _magicLinkTokenRepository.GetByTokenAsync(request.Token, cancellationToken);
        if (magicLinkToken == null)
        {
            _logger.LogWarning("Magic link verification failed: token not found");
            return Result.Failure<LoginResponse>("INVALID_TOKEN", "Invalid or expired magic link");
        }

        if (magicLinkToken.IsUsed)
        {
            _logger.LogWarning("Magic link verification failed: token already used");
            return Result.Failure<LoginResponse>("TOKEN_ALREADY_USED", "This magic link has already been used");
        }

        if (magicLinkToken.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Magic link verification failed: token expired");
            return Result.Failure<LoginResponse>("TOKEN_EXPIRED", "This magic link has expired");
        }

        var tenantUser = await _tenantUserRepository.GetByIdAsync(magicLinkToken.TenantUserId, cancellationToken);
        if (tenantUser == null)
        {
            _logger.LogWarning("Magic link verification failed: tenant user not found");
            return Result.Failure<LoginResponse>("USER_NOT_FOUND", "User not found");
        }

        if (tenantUser.Status != Domain.Enums.TenantUserStatus.Active)
        {
            _logger.LogWarning("Magic link verification failed: user account disabled for TenantUserId: {TenantUserId}", tenantUser.Id);
            return Result.Failure<LoginResponse>("USER_INACTIVE", "User account is not active");
        }

        // Mark token as used
        magicLinkToken.IsUsed = true;
        await _magicLinkTokenRepository.UpdateAsync(magicLinkToken, cancellationToken);

        // Get global user for audit logging
        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);

        // Generate tokens
        var clientId = request.ClientId ?? Guid.Empty;
        var accessToken = await _authService.GenerateAccessTokenAsync(tenantUser.Id, tenantUser.TenantId, clientId, cancellationToken);
        var idToken = await _authService.GenerateIdTokenAsync(tenantUser.Id, tenantUser.TenantId, clientId, cancellationToken);

        // Update last login timestamp
        tenantUser.LastLoginAt = DateTime.UtcNow;
        if (tenantUser.FirstLoginAt == null)
        {
            tenantUser.FirstLoginAt = DateTime.UtcNow;
        }
        await _tenantUserRepository.UpdateAsync(tenantUser, cancellationToken);

        // Create login session
        var sessionToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        var loginSession = new UserLoginSession
        {
            Id = Guid.NewGuid(),
            TenantUserId = tenantUser.Id,
            SessionToken = sessionToken,
            ExpiresAt = DateTime.UtcNow.AddHours(24), // 24 hour session
            CreatedAt = DateTime.UtcNow,
            IpAddress = null, // Can be passed from request context if available
            UserAgent = null  // Can be passed from request context if available
        };
        await _userLoginSessionRepository.AddAsync(loginSession, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = tenantUser.TenantId,
            ActorId = tenantUser.Id,
            EventType = AuditEventType.UserLogin,
            Description = $"User '{globalUser?.Email ?? "Unknown"}' logged in successfully via magic link",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantUserId = tenantUser.Id, Email = globalUser?.Email, ClientId = clientId, Method = "MagicLink" })
        }, cancellationToken);

        _logger.LogInformation("Magic link login successful for TenantUserId: {TenantUserId}, Email: {Email}", tenantUser.Id, globalUser?.Email);

        return Result.Success(new LoginResponse
        {
            AccessToken = accessToken,
            IdToken = idToken,
            TokenType = "Bearer",
            ExpiresIn = 3600
        });
    }
}
