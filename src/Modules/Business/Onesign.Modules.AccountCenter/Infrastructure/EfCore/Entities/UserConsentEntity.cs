using Onesign.Modules.AccountCenter.Domain.Enums;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

public class UserConsentEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public ConsentStatus Status { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? RevokeReason { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
}
