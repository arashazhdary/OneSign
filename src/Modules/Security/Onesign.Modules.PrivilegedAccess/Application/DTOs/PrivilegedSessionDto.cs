namespace Onesign.Modules.PrivilegedAccess.Application.DTOs;

public class PrivilegedSessionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? JitGrantId { get; set; }
    public string SessionType { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? SourceIp { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RecordingUrl { get; set; }
}
