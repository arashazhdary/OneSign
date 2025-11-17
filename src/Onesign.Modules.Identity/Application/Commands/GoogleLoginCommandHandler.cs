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

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, Result<LoginResponse>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IExternalLoginRepository _externalLoginRepository;
    private readonly IUserLoginSessionRepository _userLoginSessionRepository;
    private readonly IAuthService _authService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GoogleLoginCommandHandler(
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

    public async Task<Result<LoginResponse>> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // Verify Google ID token
        var googleClientId = _configuration["Google:ClientId"];
        if (string.IsNullOrEmpty(googleClientId))
        {
            return Result.Failure<LoginResponse>("GOOGLE_NOT_CONFIGURED", "Google authentication is not configured");
        }

        // Validate Google ID token with Google's API
        try
        {
            var validationUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(request.IdToken)}";
            var response = await _httpClient.GetAsync(validationUrl, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return Result.Failure<LoginResponse>("INVALID_GOOGLE_TOKEN", "Invalid Google ID Token.");
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var googleTokenInfo = JsonSerializer.Deserialize<GoogleTokenInfo>(content);

            if (googleTokenInfo == null || googleTokenInfo.aud != googleClientId)
            {
                return Result.Failure<LoginResponse>("INVALID_GOOGLE_TOKEN", "Invalid Google ID Token or audience mismatch.");
            }

            var email = googleTokenInfo.email;
            var googleUserId = googleTokenInfo.sub;

            if (string.IsNullOrEmpty(email))
            {
                return Result.Failure<LoginResponse>("GOOGLE_EMAIL_MISSING", "Google ID Token does not contain email.");
            }

            if (string.IsNullOrEmpty(googleUserId))
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
                    EmailVerified = googleTokenInfo.email_verified,
                    CreatedAt = DateTime.UtcNow
                };
                await _globalUserRepository.AddAsync(globalUser, cancellationToken);
            }
            else if (!globalUser.EmailVerified && googleTokenInfo.email_verified)
            {
                globalUser.EmailVerified = true;
                await _globalUserRepository.UpdateAsync(globalUser, cancellationToken);
            }

            // Find or create external login
            var externalLogin = await _externalLoginRepository.GetByProviderAndProviderUserIdAsync(
                "Google", googleUserId, cancellationToken);

            if (externalLogin == null)
            {
                externalLogin = new Domain.Entities.ExternalLogin
                {
                    Id = Guid.NewGuid(),
                    GlobalUserId = globalUser.Id,
                    Provider = "Google",
                    ProviderUserId = googleUserId,
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
            return Result.Failure<LoginResponse>("TOKEN_VALIDATION_ERROR", $"Failed to validate Google token: {ex.Message}");
        }
    }

    private class GoogleTokenInfo
    {
        public string iss { get; set; } = string.Empty;
        public string azp { get; set; } = string.Empty;
        public string aud { get; set; } = string.Empty;
        public string sub { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public bool email_verified { get; set; }
        public string at_hash { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string picture { get; set; } = string.Empty;
        public string given_name { get; set; } = string.Empty;
        public string family_name { get; set; } = string.Empty;
        public long iat { get; set; }
        public long exp { get; set; }
    }
}

