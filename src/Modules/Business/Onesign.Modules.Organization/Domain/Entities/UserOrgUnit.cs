namespace Onesign.Modules.Organization.Domain.Entities;

public class UserOrgUnit
{
    public Guid TenantUserId { get; set; }
    public Guid OrgUnitId { get; set; }
    public bool IsPrimary { get; set; }
}

