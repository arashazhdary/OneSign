namespace Onesign.Modules.ChangeManagement.Application.DTOs;

public class ChangeExecutionLogDto
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid? ItemId { get; set; }
    public string Step { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
