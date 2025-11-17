namespace Onesign.Modules.Audit.Application.DTOs;

public class AuditFilterRequest
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Domain.Enums.AuditEventType? EventType { get; set; }
    public Guid? ActorId { get; set; }
}

