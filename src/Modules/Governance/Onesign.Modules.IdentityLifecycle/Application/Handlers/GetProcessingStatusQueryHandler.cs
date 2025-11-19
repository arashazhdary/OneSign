using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetProcessingStatusQueryHandler : IRequestHandler<GetProcessingStatusQuery, Result<ProcessingStatusDto>>
{
    private readonly ILifecycleEventRepository _repository;

    public GetProcessingStatusQueryHandler(ILifecycleEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProcessingStatusDto>> Handle(GetProcessingStatusQuery request, CancellationToken cancellationToken)
    {
        var events = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var status = new ProcessingStatusDto
        {
            TotalEvents = events.Count,
            PendingEvents = events.Count(e => e.Status == ProcessingStatus.Pending),
            ProcessedEvents = events.Count(e => e.Status == ProcessingStatus.Completed),
            FailedEvents = events.Count(e => e.Status == ProcessingStatus.Failed),
            LastProcessedAt = events
                .Where(e => e.ProcessedAt.HasValue)
                .OrderByDescending(e => e.ProcessedAt)
                .FirstOrDefault()?.ProcessedAt,
            NextScheduledRun = DateTime.UtcNow.AddMinutes(5), // Assuming 5 min interval
            RecentEvents = events
                .OrderByDescending(e => e.CreatedAt)
                .Take(10)
                .Select(e => new RecentEventDto
                {
                    EventId = e.Id,
                    EventType = e.EventType.ToString(),
                    UserId = e.UserId,
                    Status = e.Status.ToString(),
                    CreatedAt = e.CreatedAt,
                    ProcessedAt = e.ProcessedAt
                }).ToList()
        };

        return Result.Success(status);
    }
}
