using MediatR;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Observability.Application.Queries;

public class SearchAuditEventsQueryHandler : IRequestHandler<SearchAuditEventsQuery, Result<AuditSearchResultDto>>
{
    private readonly IAuditEventRepository _auditEventRepository;

    public SearchAuditEventsQueryHandler(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task<Result<AuditSearchResultDto>> Handle(SearchAuditEventsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter;
        var skip = (filter.PageNumber - 1) * filter.PageSize;

        var events = await _auditEventRepository.SearchAsync(
            filter.TenantId,
            filter.FromDate,
            filter.ToDate,
            filter.Category,
            filter.Severity,
            filter.ActorId,
            filter.Action,
            skip,
            filter.PageSize,
            cancellationToken);

        var totalCount = await _auditEventRepository.CountAsync(
            filter.TenantId,
            filter.FromDate,
            filter.ToDate,
            filter.Category,
            filter.Severity,
            filter.ActorId,
            filter.Action,
            cancellationToken);

        var result = new AuditSearchResultDto
        {
            Events = events.Select(e => new AuditEventDto
            {
                Id = e.Id,
                TenantId = e.TenantId,
                CorrelationId = e.CorrelationId,
                Category = e.Category,
                Severity = e.Severity,
                ActorId = e.ActorId,
                ActorDisplayName = e.ActorDisplayName,
                ActorType = e.ActorType,
                Action = e.Action,
                TargetType = e.TargetType,
                TargetId = e.TargetId,
                IpAddress = e.IpAddress,
                UserAgent = e.UserAgent,
                Country = e.Country,
                OccurredAt = e.OccurredAt,
                DataJson = e.DataJson
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };

        return Result.Success(result);
    }
}
