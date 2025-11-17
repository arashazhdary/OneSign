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

public class PasswordLoginCommandHandler : IRequestHandler<PasswordLoginCommand, Result<LoginResponse>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuthService _authService;
    private readonly IUserLoginSessionRepository _userLoginSessionRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<PasswordLoginCommandHandler> _logger;

    public PasswordLoginCommandHandler(
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IPasswordHasher passwordHasher,
        IAuthService authService,
        IUserLoginSessionRepository userLoginSessionRepository,
        IMediator mediator,
        ILogger<PasswordLoginCommandHandler> logger)
    {
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _passwordHasher = passwordHasher;
        _authService = authService;
        _userLoginSessionRepository = userLoginSessionRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<LoginResponse>> Handle(PasswordLoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login attempt for email: {Email}, TenantId: {TenantId}", request.Email, request.TenantId);
        
        var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (globalUser == null || string.IsNullOrEmpty(globalUser.PasswordHash))
        {
            _logger.LogWarning("Login failed: user not found for email: {Email}", request.Email);
            return Result.Failure<LoginResponse>("INVALID_CREDENTIALS", "Invalid email or password");
        }

        if (!_passwordHasher.VerifyPassword(request.Password, globalUser.PasswordHash))
        {
            _logger.LogWarning("Login failed: invalid password for email: {Email}", request.Email);
            return Result.Failure<LoginResponse>("INVALID_CREDENTIALS", "Invalid email or password");
        }

        var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
            globalUser.Id, request.TenantId, cancellationToken);
        if (tenantUser == null)
        {
            _logger.LogWarning("Login failed: user not in tenant for email: {Email}, TenantId: {TenantId}", request.Email, request.TenantId);
            return Result.Failure<LoginResponse>("USER_NOT_IN_TENANT", "User is not a member of this tenant");
        }

        if (tenantUser.Status != Domain.Enums.TenantUserStatus.Active)
        {
            _logger.LogWarning("Login failed: user account disabled for TenantUserId: {TenantUserId}", tenantUser.Id);
            return Result.Failure<LoginResponse>("USER_INACTIVE", "User account is not active");
        }

        var clientId = request.ClientId ?? Guid.Empty;
        var accessToken = await _authService.GenerateAccessTokenAsync(tenantUser.Id, request.TenantId, clientId, cancellationToken);
        var idToken = await _authService.GenerateIdTokenAsync(tenantUser.Id, request.TenantId, clientId, cancellationToken);

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
            TenantId = request.TenantId,
            ActorId = tenantUser.Id,
            EventType = AuditEventType.UserLogin,
            Description = $"User '{globalUser.Email}' logged in successfully",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantUserId = tenantUser.Id, Email = globalUser.Email, ClientId = clientId })
        }, cancellationToken);

        _logger.LogInformation("Login successful for TenantUserId: {TenantUserId}, Email: {Email}", tenantUser.Id, globalUser.Email);

        return Result.Success(new LoginResponse
        {
            AccessToken = accessToken,
            IdToken = idToken,
            TokenType = "Bearer",
            ExpiresIn = 3600
        });
    }
}

