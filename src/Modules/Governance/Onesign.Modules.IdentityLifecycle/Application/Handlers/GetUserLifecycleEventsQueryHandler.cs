using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetUserLifecycleEventsQueryHandler : IRequestHandler<GetUserLifecycleEventsQuery, Result<List<LifecycleEventDto>>>
{
    private readonly ILifecycleEventRepository _repository;

    public GetUserLifecycleEventsQueryHandler(ILifecycleEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<LifecycleEventDto>>> Handle(GetUserLifecycleEventsQuery request, CancellationToken cancellationToken)
    {
        // Get HR record by user email (assuming UserId maps to email or external ID)
        // For now, we'll need to get all events and filter, or add a method to repository
        // Since we don't have GetByUserIdAsync, we'll use GetPendingEventsAsync and filter
        var allEvents = await _repository.GetPendingEventsAsync(request.TenantId, 1000, cancellationToken);
        // Note: This is a workaround - ideally we'd have a method to get events by user
        var events = allEvents.Where(e => e.HRRecordId == request.UserId).ToList();

        var dtos = events.Select(e => new LifecycleEventDto
        {
            Id = e.Id,
            TenantId = e.TenantId,
            UserId = e.HRRecordId, // Using HRRecordId as UserId for now
            EventType = e.EventType.ToString(),
            Status = e.Status.ToString(),
            PreviousState = e.OldSnapshotJson,
            NewState = e.NewSnapshotJson,
            EffectiveDate = e.CreatedAt,
            CreatedAt = e.CreatedAt,
            ProcessedAt = e.ProcessedAt,
            ErrorMessage = e.ErrorMessage
        }).ToList();

        return Result.Success(dtos);
    }
}
