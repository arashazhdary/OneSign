using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;

namespace Onesign.Modules.Identity.Application.Commands;

public class AppleLoginCommandHandler : IRequestHandler<AppleLoginCommand, Result<LoginResponse>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IExternalLoginRepository _externalLoginRepository;
    private readonly IUserLoginSessionRepository _userLoginSessionRepository;
    private readonly IAuthService _authService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private static readonly Dictionary<string, ApplePublicKey> _cachedKeys = new();
    private static DateTime _keyCacheExpiration = DateTime.MinValue;

    public AppleLoginCommandHandler(
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

    public async Task<Result<LoginResponse>> Handle(AppleLoginCommand request, CancellationToken cancellationToken)
    {
        // Get Apple configuration
        var appleServiceId = _configuration["Apple:ServiceId"];
        var appleTeamId = _configuration["Apple:TeamId"];

        if (string.IsNullOrEmpty(appleServiceId))
        {
            return Result.Failure<LoginResponse>("APPLE_NOT_CONFIGURED", "Apple authentication is not configured");
        }

        try
        {
            // Validate Apple ID token
            var (isValid, claims, errorMessage) = await ValidateAppleTokenAsync(request.IdToken, appleServiceId, cancellationToken);

            if (!isValid || claims == null)
            {
                return Result.Failure<LoginResponse>("INVALID_APPLE_TOKEN", errorMessage ?? "Invalid Apple ID Token.");
            }

            // Extract user information from claims
            var appleUserId = claims.FindFirst("sub")?.Value;
            var email = claims.FindFirst("email")?.Value;
            var emailVerified = claims.FindFirst("email_verified")?.Value == "true";
            var isPrivateEmail = claims.FindFirst("is_private_email")?.Value == "true";

            if (string.IsNullOrEmpty(appleUserId))
            {
                return Result.Failure<LoginResponse>("INVALID_TOKEN", "Token missing user ID");
            }

            if (string.IsNullOrEmpty(email))
            {
                return Result.Failure<LoginResponse>("APPLE_EMAIL_MISSING", "Apple ID Token does not contain email.");
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
                    EmailVerified = emailVerified,
                    CreatedAt = DateTime.UtcNow
                };
                await _globalUserRepository.AddAsync(globalUser, cancellationToken);
            }
            else if (!globalUser.EmailVerified && emailVerified)
            {
                globalUser.EmailVerified = true;
                await _globalUserRepository.UpdateAsync(globalUser, cancellationToken);
            }

            // Find or create external login
            var externalLogin = await _externalLoginRepository.GetByProviderAndProviderUserIdAsync(
                "Apple", appleUserId, cancellationToken);

            if (externalLogin == null)
            {
                externalLogin = new Domain.Entities.ExternalLogin
                {
                    Id = Guid.NewGuid(),
                    GlobalUserId = globalUser.Id,
                    Provider = "Apple",
                    ProviderUserId = appleUserId,
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
            return Result.Failure<LoginResponse>("TOKEN_VALIDATION_ERROR", $"Failed to validate Apple token: {ex.Message}");
        }
    }

    private async Task<(bool isValid, ClaimsPrincipal? claims, string? errorMessage)> ValidateAppleTokenAsync(
        string idToken, string audience, CancellationToken cancellationToken)
    {
        try
        {
            // Fetch Apple's public keys
            var publicKeys = await GetApplePublicKeysAsync(cancellationToken);

            if (publicKeys == null || publicKeys.Count == 0)
            {
                return (false, null, "Failed to fetch Apple public keys");
            }

            // Decode the JWT header to get the key ID (kid)
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(idToken);
            var kid = jwtToken.Header.Kid;

            if (string.IsNullOrEmpty(kid) || !publicKeys.ContainsKey(kid))
            {
                return (false, null, "Invalid key ID in token");
            }

            var publicKey = publicKeys[kid];

            // Create RSA security key from the public key
            var rsa = RSA.Create();
            rsa.ImportParameters(new RSAParameters
            {
                Modulus = Base64UrlEncoder.DecodeBytes(publicKey.N),
                Exponent = Base64UrlEncoder.DecodeBytes(publicKey.E)
            });

            var securityKey = new RsaSecurityKey(rsa);

            // Validate the token
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "https://appleid.apple.com",
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ClockSkew = TimeSpan.FromMinutes(5) // Allow 5 minutes clock skew
            };

            var principal = handler.ValidateToken(idToken, validationParameters, out var validatedToken);

            return (true, principal, null);
        }
        catch (SecurityTokenExpiredException)
        {
            return (false, null, "Apple ID Token has expired");
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            return (false, null, "Invalid Apple ID Token signature");
        }
        catch (Exception ex)
        {
            return (false, null, $"Token validation failed: {ex.Message}");
        }
    }

    private async Task<Dictionary<string, ApplePublicKey>?> GetApplePublicKeysAsync(CancellationToken cancellationToken)
    {
        // Check cache first (cache for 24 hours)
        if (_keyCacheExpiration > DateTime.UtcNow && _cachedKeys.Count > 0)
        {
            return _cachedKeys;
        }

        try
        {
            var response = await _httpClient.GetAsync("https://appleid.apple.com/auth/keys", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jwks = JsonSerializer.Deserialize<AppleJwks>(content);

            if (jwks?.Keys == null || jwks.Keys.Count == 0)
            {
                return null;
            }

            // Clear and update cache
            _cachedKeys.Clear();
            foreach (var key in jwks.Keys)
            {
                if (!string.IsNullOrEmpty(key.Kid))
                {
                    _cachedKeys[key.Kid] = key;
                }
            }

            // Set cache expiration to 24 hours from now
            _keyCacheExpiration = DateTime.UtcNow.AddHours(24);

            return _cachedKeys;
        }
        catch
        {
            return null;
        }
    }

    private class AppleJwks
    {
        public List<ApplePublicKey> Keys { get; set; } = new();
    }

    private class ApplePublicKey
    {
        public string Kty { get; set; } = string.Empty;
        public string Kid { get; set; } = string.Empty;
        public string Use { get; set; } = string.Empty;
        public string Alg { get; set; } = string.Empty;
        public string N { get; set; } = string.Empty;
        public string E { get; set; } = string.Empty;
    }
}
