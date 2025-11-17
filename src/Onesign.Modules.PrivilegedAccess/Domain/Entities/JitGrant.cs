using Onesign.Modules.PrivilegedAccess.Domain.Enums;

namespace Onesign.Modules.PrivilegedAccess.Domain.Entities;

public class JitGrant
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid ApprovedBy { get; set; }
    public Guid? AccessRequestId { get; set; }
    public JitGrantStatus Status { get; set; }
    public string Justification { get; set; } = string.Empty;
}
