namespace Onesign.Modules.Privacy.Application.DTOs;

public class DataSubjectRequestDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid SubjectId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public Guid RequestedBy { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResultLocation { get; set; }
    public string? Reason { get; set; }
}
