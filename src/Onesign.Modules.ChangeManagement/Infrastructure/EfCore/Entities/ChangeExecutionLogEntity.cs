namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

public class ChangeExecutionLogEntity
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid? ItemId { get; set; }
    public int Step { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ChangeSetEntity ChangeSet { get; set; } = null!;
}
