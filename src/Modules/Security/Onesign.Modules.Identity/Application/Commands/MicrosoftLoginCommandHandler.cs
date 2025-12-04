using MediatR;
using Microsoft.Extensions.Configuration;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;
using System.Security.Cryptography;
using System.Text.Json;

namespace Onesign.Modules.Identity.Application.Commands;

public class MicrosoftLoginCommandHandler : IRequestHandler<MicrosoftLoginCommand, Result<LoginResponse>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IExternalLoginRepository _externalLoginRepository;
    private readonly IUserLoginSessionRepository _userLoginSessionRepository;
    private readonly IAuthService _authService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public MicrosoftLoginCommandHandler(
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IExternalLoginRepository externalLoginRepository,
        IUserLoginSessionRepository userLoginSessionRepository,
        IAuthService authService,
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _externalLoginRepository = externalLoginRepository;
        _userLoginSessionRepository = userLoginSessionRepository;
        _authService = authService;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<Result<LoginResponse>> Handle(MicrosoftLoginCommand request, CancellationToken cancellationToken)
    {
        // Verify Microsoft ID token
        var microsoftClientId = _configuration["Microsoft:ClientId"];
        if (string.IsNullOrEmpty(microsoftClientId))
        {
            return Result.Failure<LoginResponse>("MICROSOFT_NOT_CONFIGURED", "Microsoft authentication is not configured");
        }

        // Validate Microsoft ID token
        try
        {
            // Decode the JWT token to extract claims
            var tokenParts = request.IdToken.Split('.');
            if (tokenParts.Length != 3)
            {
                return Result.Failure<LoginResponse>("INVALID_MICROSOFT_TOKEN", "Invalid Microsoft ID Token format.");
            }

            var payload = tokenParts[1];
            var padding = payload.Length % 4;
            if (padding != 0)
            {
                payload += new string('=', 4 - padding);
            }

            var payloadBytes = Convert.FromBase64String(payload);
            var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);
            var microsoftTokenInfo = JsonSerializer.Deserialize<MicrosoftTokenInfo>(payloadJson);

            if (microsoftTokenInfo == null)
            {
                return Result.Failure<LoginResponse>("INVALID_MICROSOFT_TOKEN", "Invalid Microsoft ID Token.");
            }

            // Verify audience (aud) matches client ID
            if (microsoftTokenInfo.aud != microsoftClientId)
            {
                return Result.Failure<LoginResponse>("INVALID_MICROSOFT_TOKEN", "Invalid Microsoft ID Token or audience mismatch.");
            }

            // Verify issuer (iss) is from Microsoft
            if (!microsoftTokenInfo.iss.Contains("login.microsoftonline.com") &&
                !microsoftTokenInfo.iss.Contains("sts.windows.net"))
            {
                return Result.Failure<LoginResponse>("INVALID_MICROSOFT_TOKEN", "Invalid Microsoft token issuer.");
            }

            // Verify token expiration
            var exp = DateTimeOffset.FromUnixTimeSeconds(microsoftTokenInfo.exp);
            if (exp < DateTimeOffset.UtcNow)
            {
                return Result.Failure<LoginResponse>("EXPIRED_TOKEN", "Microsoft ID Token has expired.");
            }

            // Extract user information
            var email = microsoftTokenInfo.email ?? microsoftTokenInfo.preferred_username;
            var microsoftUserId = microsoftTokenInfo.sub ?? microsoftTokenInfo.oid;

            if (string.IsNullOrEmpty(email))
            {
                return Result.Failure<LoginResponse>("MICROSOFT_EMAIL_MISSING", "Microsoft ID Token does not contain email.");
            }

            if (string.IsNullOrEmpty(microsoftUserId))
            {
                return Result.Failure<LoginResponse>("INVALID_TOKEN", "Token missing user ID");
            }

            // Find or create global user
            var globalUser = await _globalUserRepository.GetByEmailAsync(email, cancellationToken);
            if (globalUser == null)
            {
                // Create new global user
                globalUser = new Domain.Entities.GlobalUser
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    EmailVerified = true, // Microsoft verifies emails
                    CreatedAt = DateTime.UtcNow
                };
                await _globalUserRepository.AddAsync(globalUser, cancellationToken);
            }
            else if (!globalUser.EmailVerified)
            {
                globalUser.EmailVerified = true;
                await _globalUserRepository.UpdateAsync(globalUser, cancellationToken);
            }

            // Find or create external login
            var externalLogin = await _externalLoginRepository.GetByProviderAndProviderUserIdAsync(
                "Microsoft", microsoftUserId, cancellationToken);

            if (externalLogin == null)
            {
                externalLogin = new Domain.Entities.ExternalLogin
                {
                    Id = Guid.NewGuid(),
                    GlobalUserId = globalUser.Id,
                    Provider = "Microsoft",
                    ProviderUserId = microsoftUserId,
                    CreatedAt = DateTime.UtcNow
                };
                await _externalLoginRepository.AddAsync(externalLogin, cancellationToken);
            }

            // Find or create tenant user
            var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
                globalUser.Id, request.TenantId, cancellationToken);

            if (tenantUser == null)
            {
                // Create tenant user (auto-activate for social login)
                tenantUser = new Domain.Entities.TenantUser
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    GlobalUserId = globalUser.Id,
                    Status = Domain.Enums.TenantUserStatus.Active,
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    FirstLoginAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };
                await _tenantUserRepository.AddAsync(tenantUser, cancellationToken);
            }
            else
            {
                if (tenantUser.Status != Domain.Enums.TenantUserStatus.Active)
                {
                    return Result.Failure<LoginResponse>("USER_INACTIVE", "User account is not active");
                }

                tenantUser.LastLoginAt = DateTime.UtcNow;
                if (tenantUser.FirstLoginAt == null)
                {
                    tenantUser.FirstLoginAt = DateTime.UtcNow;
                }
                await _tenantUserRepository.UpdateAsync(tenantUser, cancellationToken);
            }

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

            // Generate tokens
            var clientId = request.ClientId ?? Guid.Empty;
            var accessToken = await _authService.GenerateAccessTokenAsync(
                tenantUser.Id, request.TenantId, clientId, cancellationToken);
            var idToken = await _authService.GenerateIdTokenAsync(
                tenantUser.Id, request.TenantId, clientId, email, cancellationToken);

            return Result.Success(new LoginResponse
            {
                AccessToken = accessToken,
                IdToken = idToken,
                TokenType = "Bearer",
                ExpiresIn = 3600
            });
        }
        catch (Exception ex)
        {
            return Result.Failure<LoginResponse>("TOKEN_VALIDATION_ERROR", $"Failed to validate Microsoft token: {ex.Message}");
        }
    }

    private class MicrosoftTokenInfo
    {
        public string aud { get; set; } = string.Empty;
        public string iss { get; set; } = string.Empty;
        public long iat { get; set; }
        public long nbf { get; set; }
        public long exp { get; set; }
        public string? email { get; set; }
        public string? preferred_username { get; set; }
        public string? name { get; set; }
        public string? nonce { get; set; }
        public string? oid { get; set; }
        public string? sub { get; set; }
        public string? tid { get; set; }
        public string? upn { get; set; }
        public string? ver { get; set; }
    }
}
