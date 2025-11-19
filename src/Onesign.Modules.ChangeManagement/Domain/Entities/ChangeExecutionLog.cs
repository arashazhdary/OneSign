using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Entities;

public class ChangeExecutionLog
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid? ItemId { get; set; }
    public ExecutionStep Step { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
