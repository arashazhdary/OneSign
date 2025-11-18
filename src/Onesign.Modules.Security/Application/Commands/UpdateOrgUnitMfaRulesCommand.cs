using MediatR;

namespace Onesign.Modules.Security.Application.Commands;

public class UpdateOrgUnitMfaRulesCommand : IRequest<Unit>
{
    public Guid TenantId { get; set; }
    public List<OrgUnitMfaRuleItem> Rules { get; set; } = new();
}

public class OrgUnitMfaRuleItem
{
    public Guid OrgUnitId { get; set; }
    public int MfaRequirement { get; set; }
}
