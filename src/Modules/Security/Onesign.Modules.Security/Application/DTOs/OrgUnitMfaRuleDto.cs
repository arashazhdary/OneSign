namespace Onesign.Modules.Security.Application.DTOs;

public class OrgUnitMfaRuleDto
{
    public Guid Id { get; set; }
    public Guid OrgUnitId { get; set; }
    public string OrgUnitName { get; set; } = string.Empty;
    public int MfaRequirement { get; set; }
}
