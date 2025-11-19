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
            HRRecordId = e.HRRecordId,
            EventType = e.EventType.ToString(),
            OldSnapshotJson = e.OldSnapshotJson,
            NewSnapshotJson = e.NewSnapshotJson,
            Status = e.Status.ToString(),
            ErrorMessage = e.ErrorMessage,
            CreatedAt = e.CreatedAt,
            ProcessedAt = e.ProcessedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
