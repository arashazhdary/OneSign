namespace Onesign.Modules.ChangeManagement.Application.DTOs;

public class ChangeItemDto
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public string TargetType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string Operation { get; set; } = string.Empty;
    public string? CurrentValueJson { get; set; }
    public string? ProposedValueJson { get; set; }
    public int Order { get; set; }
}
