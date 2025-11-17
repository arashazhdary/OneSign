using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Domain.Entities;

public class DelegatedAdminScope
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }  // This user is an admin
    public Guid OrgUnitId { get; set; }     // Root of their permissions
    public AdminScopeType ScopeType { get; set; }  // OrgOnly or OrgAndDescendants
    public DateTime CreatedAt { get; set; }
}

