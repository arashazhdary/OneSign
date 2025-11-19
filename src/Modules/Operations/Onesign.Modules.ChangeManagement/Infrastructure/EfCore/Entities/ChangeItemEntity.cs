namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

public class ChangeItemEntity
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public int TargetType { get; set; }
    public Guid TargetId { get; set; }
    public int Operation { get; set; }
    public string? CurrentValueJson { get; set; }
    public string? ProposedValueJson { get; set; }
    public int Order { get; set; }

    public ChangeSetEntity ChangeSet { get; set; } = null!;
}
