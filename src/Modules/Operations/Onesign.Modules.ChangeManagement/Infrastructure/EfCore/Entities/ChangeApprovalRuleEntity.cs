namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

public class ChangeApprovalRuleEntity
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public int Category { get; set; }
    public int MinApprovers { get; set; }
    public bool RequireSeparationOfDuties { get; set; }
}
