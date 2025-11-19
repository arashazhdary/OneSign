using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class OrgUnitMfaRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid OrgUnitId { get; private set; }
    public bool MfaRequired { get; private set; }
    public MfaRequirementLevel MfaRequirement { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private OrgUnitMfaRule()
    {
    }

    public OrgUnitMfaRule(
        Guid id,
        Guid tenantId,
        Guid orgUnitId,
        bool mfaRequired)
    {
        Id = id;
        TenantId = tenantId;
        OrgUnitId = orgUnitId;
        MfaRequired = mfaRequired;
        CreatedAt = DateTime.UtcNow;
    }

    public static OrgUnitMfaRule Create(
        Guid tenantId,
        Guid orgUnitId,
        MfaRequirementLevel mfaRequirement)
    {
        return new OrgUnitMfaRule
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            OrgUnitId = orgUnitId,
            MfaRequired = mfaRequirement != MfaRequirementLevel.None,
            MfaRequirement = mfaRequirement,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateRequirement(MfaRequirementLevel mfaRequirement)
    {
        MfaRequirement = mfaRequirement;
        MfaRequired = mfaRequirement != MfaRequirementLevel.None;
        UpdatedAt = DateTime.UtcNow;
    }
}
