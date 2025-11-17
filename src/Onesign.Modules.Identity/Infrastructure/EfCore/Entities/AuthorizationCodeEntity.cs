using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class AuthorizationCodeEntity
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid TenantUserId { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string RedirectUri { get; set; } = string.Empty;
    public string CodeChallenge { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }

    public AuthorizationCode ToDomain()
    {
        return new AuthorizationCode
        {
            Id = Id,
            Code = Code,
            TenantUserId = TenantUserId,
            ApplicationClientId = ApplicationClientId,
            RedirectUri = RedirectUri,
            CodeChallenge = CodeChallenge,
            ExpiresAt = ExpiresAt,
            IsUsed = IsUsed,
            CreatedAt = CreatedAt
        };
    }

    public static AuthorizationCodeEntity FromDomain(AuthorizationCode domain)
    {
        return new AuthorizationCodeEntity
        {
            Id = domain.Id,
            Code = domain.Code,
            TenantUserId = domain.TenantUserId,
            ApplicationClientId = domain.ApplicationClientId,
            RedirectUri = domain.RedirectUri,
            CodeChallenge = domain.CodeChallenge,
            ExpiresAt = domain.ExpiresAt,
            IsUsed = domain.IsUsed,
            CreatedAt = domain.CreatedAt
        };
    }
}

