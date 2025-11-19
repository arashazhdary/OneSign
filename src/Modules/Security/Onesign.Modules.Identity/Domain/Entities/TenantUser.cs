using Onesign.Modules.Identity.Domain.Enums;

namespace Onesign.Modules.Identity.Domain.Entities;

public class TenantUser
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
}

