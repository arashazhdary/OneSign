using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Entities;

public class ChangeApprovalRule
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public ChangeCategory Category { get; set; }
    public int MinApprovers { get; set; }
    public bool RequireSeparationOfDuties { get; set; }
}
