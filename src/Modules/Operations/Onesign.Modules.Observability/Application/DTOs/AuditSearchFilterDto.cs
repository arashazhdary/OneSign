using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Application.DTOs;

public class AuditSearchFilterDto
{
    public Guid? TenantId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public AuditCategory? Category { get; set; }
    public AuditSeverity? Severity { get; set; }
    public string? ActorId { get; set; }
    public string? Action { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
