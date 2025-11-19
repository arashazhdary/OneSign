using MediatR;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Audit.Application.Queries;

public class GetAuditEventsQueryHandler : IRequestHandler<GetAuditEventsQuery, PagedResult<AuditEventDto>>
{
    private readonly IAuditEventRepository _auditEventRepository;

    public GetAuditEventsQueryHandler(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task<PagedResult<AuditEventDto>> Handle(GetAuditEventsQuery request, CancellationToken cancellationToken)
    {
        var events = await _auditEventRepository.GetByTenantIdAsync(
            request.TenantId,
            request.FromDate,
            request.ToDate,
            cancellationToken);

        if (request.EventType.HasValue)
        {
            events = events.Where(x => x.EventType == request.EventType.Value).ToList();
        }

        if (request.ActorId.HasValue)
        {
            events = events.Where(x => x.ActorId == request.ActorId.Value).ToList();
        }

        var totalCount = events.Count;
        var pagedEvents = events
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PagedResult<AuditEventDto>
        {
            Items = pagedEvents.Select(x => new AuditEventDto
            {
                Id = x.Id,
                TenantId = x.TenantId,
                ActorId = x.ActorId,
                EventType = x.EventType,
                Description = x.Description,
                Metadata = x.Metadata,
                CreatedAt = x.CreatedAt,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

