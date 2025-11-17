using Onesign.Modules.Audit.Domain.Enums;

namespace Onesign.Modules.Audit.Infrastructure.EfCore.Entities;

public class AuditEventEntity
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? ActorId { get; set; }
    public AuditEventType EventType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

