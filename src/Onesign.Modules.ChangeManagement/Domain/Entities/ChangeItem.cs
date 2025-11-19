using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Entities;

public class ChangeItem
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public ChangeTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public ChangeOperation Operation { get; set; }
    public string? CurrentValueJson { get; set; }
    public string? ProposedValueJson { get; set; }
    public int Order { get; set; }
}
