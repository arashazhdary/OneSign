using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

public class ScimTokenEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public ScimTokenStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }

    public ScimToken ToDomain()
    {
        return new ScimToken
        {
            Id = Id,
            TenantId = TenantId,
            Name = Name,
            TokenHash = TokenHash,
            Status = Status,
            CreatedAt = CreatedAt,
            ExpiresAt = ExpiresAt,
            LastUsedAt = LastUsedAt
        };
    }

    public static ScimTokenEntity FromDomain(ScimToken token)
    {
        return new ScimTokenEntity
        {
            Id = token.Id,
            TenantId = token.TenantId,
            Name = token.Name,
            TokenHash = token.TokenHash,
            Status = token.Status,
            CreatedAt = token.CreatedAt,
            ExpiresAt = token.ExpiresAt,
            LastUsedAt = token.LastUsedAt
        };
    }
}
