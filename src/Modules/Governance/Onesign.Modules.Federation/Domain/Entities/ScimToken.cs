using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Domain.Entities;

public class ScimToken
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public ScimTokenStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }

    public void Revoke()
    {
        Status = ScimTokenStatus.Revoked;
    }

    public void UpdateLastUsed()
    {
        LastUsedAt = DateTime.UtcNow;
    }
}
