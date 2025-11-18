namespace Onesign.Modules.Security.Domain.Entities;

public class OrgUnitMfaRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid OrgUnitId { get; private set; }
    public bool MfaRequired { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

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
}
