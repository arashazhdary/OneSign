namespace Onesign.Modules.Security.Application.DTOs;

public class UpdateOrgUnitMfaRulesRequest
{
    public List<OrgUnitMfaRuleItem> Rules { get; set; } = new();
}

public class OrgUnitMfaRuleItem
{
    public Guid OrgUnitId { get; set; }
    public int MfaRequirement { get; set; }
}
