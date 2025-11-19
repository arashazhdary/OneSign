using MediatR;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Audit.Application.Queries;

public class GetAuditEventsQuery : IRequest<PagedResult<AuditEventDto>>
{
    public Guid TenantId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Domain.Enums.AuditEventType? EventType { get; set; }
    public Guid? ActorId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

