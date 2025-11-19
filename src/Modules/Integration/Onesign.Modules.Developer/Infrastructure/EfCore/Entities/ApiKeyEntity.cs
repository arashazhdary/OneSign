using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

public class ApiKeyEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ServiceAccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public ApiKeyStatus Status { get; set; }
    public string ScopesJson { get; set; } = string.Empty; // JSON array
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }

    public ServiceAccountEntity? ServiceAccount { get; set; }
}
