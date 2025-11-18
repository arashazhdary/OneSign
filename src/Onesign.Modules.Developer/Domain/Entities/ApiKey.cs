using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Domain.Entities;

public class ApiKey
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ServiceAccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty; // SHA256 hash - never store plain key
    public string KeyPrefix { get; set; } = string.Empty; // First 8 chars for identification
    public ApiKeyStatus Status { get; set; }
    public List<string> Scopes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }

    public ServiceAccount? ServiceAccount { get; set; }
}
