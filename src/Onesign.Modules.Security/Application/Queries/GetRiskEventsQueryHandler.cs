using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Queries;

public class GetRiskEventsQueryHandler : IRequestHandler<GetRiskEventsQuery, List<RiskEventDto>>
{
    private readonly IRiskEventRepository _repository;

    public GetRiskEventsQueryHandler(IRiskEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<RiskEventDto>> Handle(GetRiskEventsQuery request, CancellationToken cancellationToken)
    {
        var events = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var filtered = events.AsQueryable();

        if (request.UserId.HasValue)
            filtered = filtered.Where(e => e.UserId == request.UserId.Value);

        if (request.EventType.HasValue)
            filtered = filtered.Where(e => (int)e.EventType == request.EventType.Value);

        if (request.RiskLevel.HasValue)
            filtered = filtered.Where(e => (int)e.RiskLevel == request.RiskLevel.Value);

        if (request.StartDate.HasValue)
            filtered = filtered.Where(e => e.OccurredAt >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            filtered = filtered.Where(e => e.OccurredAt <= request.EndDate.Value);

        var paginated = filtered
            .OrderByDescending(e => e.OccurredAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        return paginated.Select(e => new RiskEventDto
        {
            Id = e.Id,
            UserId = e.UserId,
            EventType = (int)e.EventType,
            RiskLevel = (int)e.RiskLevel,
            IpAddress = e.IpAddress,
            UserAgent = e.UserAgent,
            Location = e.Location,
            Details = e.Details,
            OccurredAt = e.OccurredAt
        }).ToList();
    }
}
