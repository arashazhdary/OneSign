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
        var events = await _repository.GetByUserIdAsync(request.TenantId, request.UserId, cancellationToken);

        var dtos = events.Select(e => new LifecycleEventDto
        {
            Id = e.Id,
            TenantId = e.TenantId,
            UserId = e.UserId,
            EventType = e.EventType.ToString(),
            Status = e.Status.ToString(),
            PreviousState = e.PreviousState,
            NewState = e.NewState,
            EffectiveDate = e.EffectiveDate,
            CreatedAt = e.CreatedAt,
            ProcessedAt = e.ProcessedAt,
            ErrorMessage = e.ErrorMessage
        }).ToList();

        return Result.Success(dtos);
    }
}
