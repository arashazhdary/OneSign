using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

public class UserOrgUnitEntity
{
    public Guid TenantUserId { get; set; }
    public Guid OrgUnitId { get; set; }
    public bool IsPrimary { get; set; }

    public UserOrgUnit ToDomain()
    {
        return new UserOrgUnit
        {
            TenantUserId = TenantUserId,
            OrgUnitId = OrgUnitId,
            IsPrimary = IsPrimary
        };
    }

    public static UserOrgUnitEntity FromDomain(UserOrgUnit userOrgUnit)
    {
        return new UserOrgUnitEntity
        {
            TenantUserId = userOrgUnit.TenantUserId,
            OrgUnitId = userOrgUnit.OrgUnitId,
            IsPrimary = userOrgUnit.IsPrimary
        };
    }
}

