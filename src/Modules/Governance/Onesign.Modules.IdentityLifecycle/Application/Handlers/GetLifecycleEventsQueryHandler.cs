using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetLifecycleEventsQueryHandler : IRequestHandler<GetLifecycleEventsQuery, Result<List<LifecycleEventDto>>>
{
    private readonly ILifecycleEventRepository _repository;

    public GetLifecycleEventsQueryHandler(ILifecycleEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<LifecycleEventDto>>> Handle(GetLifecycleEventsQuery request, CancellationToken cancellationToken)
    {
        var events = string.IsNullOrEmpty(request.Status) || !Enum.TryParse<ProcessingStatus>(request.Status, true, out var status)
            ? await _repository.GetPendingEventsAsync(request.TenantId, 1000, cancellationToken)
            : await _repository.GetByStatusAsync(request.TenantId, status, cancellationToken);

        var dtos = events.Select(e => new LifecycleEventDto
        {
            Id = e.Id,
            TenantId = e.TenantId,
            UserId = Guid.Empty, // HRRecord does not have UserId property
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
