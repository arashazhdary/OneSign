using Onesign.Modules.Identity.Domain.Enums;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class TenantUserEntity
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }
    public Guid TenantId { get; set; }
    public TenantUserStatus Status { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime? FirstLoginAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Automation-related fields
    public bool RequireMfaNextSignIn { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockedAt { get; set; }
    public string? LockReason { get; set; }
    public bool IsActive { get; set; } = true;
}

