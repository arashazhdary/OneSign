using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

public class ApplicationOrgUnitEntity
{
    public Guid ApplicationClientId { get; set; }
    public Guid OrgUnitId { get; set; }

    public ApplicationOrgUnit ToDomain()
    {
        return new ApplicationOrgUnit
        {
            ApplicationClientId = ApplicationClientId,
            OrgUnitId = OrgUnitId
        };
    }

    public static ApplicationOrgUnitEntity FromDomain(ApplicationOrgUnit applicationOrgUnit)
    {
        return new ApplicationOrgUnitEntity
        {
            ApplicationClientId = applicationOrgUnit.ApplicationClientId,
            OrgUnitId = applicationOrgUnit.OrgUnitId
        };
    }
}

