using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class OrgUnitMfaRuleEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OrgUnitId { get; set; }
    public bool MfaRequired { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static OrgUnitMfaRuleEntity FromDomain(OrgUnitMfaRule domain)
    {
        return new OrgUnitMfaRuleEntity
        {
            Id = domain.Id,
            TenantId = domain.TenantId,
            OrgUnitId = domain.OrgUnitId,
            MfaRequired = domain.MfaRequired,
            CreatedAt = domain.CreatedAt,
            UpdatedAt = domain.UpdatedAt
        };
    }

    public OrgUnitMfaRule ToDomain()
    {
        var rule = new OrgUnitMfaRule(
            Id,
            TenantId,
            OrgUnitId,
            MfaRequired
        );

        typeof(OrgUnitMfaRule).GetProperty(nameof(CreatedAt))!
            .SetValue(rule, CreatedAt);
        typeof(OrgUnitMfaRule).GetProperty(nameof(UpdatedAt))!
            .SetValue(rule, UpdatedAt);

        return rule;
    }
}
