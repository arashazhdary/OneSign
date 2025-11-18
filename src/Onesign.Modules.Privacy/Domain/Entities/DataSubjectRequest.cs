using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Entities;

public class DataSubjectRequest
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid SubjectId { get; set; }
    public DataSubjectRequestType Type { get; set; }
    public DataSubjectRequestStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public Guid RequestedBy { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResultLocation { get; set; }
    public string? Reason { get; set; }
}
