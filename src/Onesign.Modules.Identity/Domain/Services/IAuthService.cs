namespace Onesign.Modules.Identity.Domain.Services;

public interface IAuthService
{
    Task<string> GenerateAuthorizationCodeAsync(Guid tenantUserId, Guid clientId, string redirectUri, string codeChallenge, CancellationToken cancellationToken = default);
    Task<(Guid TenantUserId, Guid ClientId, string RedirectUri, string CodeChallenge)?> ValidateAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<string> GenerateAccessTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, CancellationToken cancellationToken = default);
    Task<string> GenerateIdTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, CancellationToken cancellationToken = default);
    Task<string> GenerateIdTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, string? email, CancellationToken cancellationToken = default);
}

