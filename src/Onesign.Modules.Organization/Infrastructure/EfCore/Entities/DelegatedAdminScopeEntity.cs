using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

public class DelegatedAdminScopeEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public Guid OrgUnitId { get; set; }
    public AdminScopeType ScopeType { get; set; }
    public DateTime CreatedAt { get; set; }

    public DelegatedAdminScope ToDomain()
    {
        return new DelegatedAdminScope
        {
            Id = Id,
            TenantUserId = TenantUserId,
            OrgUnitId = OrgUnitId,
            ScopeType = ScopeType,
            CreatedAt = CreatedAt
        };
    }

    public static DelegatedAdminScopeEntity FromDomain(DelegatedAdminScope delegatedAdminScope)
    {
        return new DelegatedAdminScopeEntity
        {
            Id = delegatedAdminScope.Id,
            TenantUserId = delegatedAdminScope.TenantUserId,
            OrgUnitId = delegatedAdminScope.OrgUnitId,
            ScopeType = delegatedAdminScope.ScopeType,
            CreatedAt = delegatedAdminScope.CreatedAt
        };
    }
}

