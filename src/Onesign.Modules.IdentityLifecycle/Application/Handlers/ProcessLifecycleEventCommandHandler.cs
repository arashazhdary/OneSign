using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class ProcessLifecycleEventCommandHandler : IRequestHandler<ProcessLifecycleEventCommand, Result<bool>>
{
    private readonly ILifecycleEventRepository _lifecycleEventRepository;
    private readonly ILifecycleProcessor _lifecycleProcessor;

    public ProcessLifecycleEventCommandHandler(
        ILifecycleEventRepository lifecycleEventRepository,
        ILifecycleProcessor lifecycleProcessor)
    {
        _lifecycleEventRepository = lifecycleEventRepository;
        _lifecycleProcessor = lifecycleProcessor;
    }

    public async Task<Result<bool>> Handle(ProcessLifecycleEventCommand request, CancellationToken cancellationToken)
    {
        var lifecycleEvent = await _lifecycleEventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (lifecycleEvent == null)
            return Result.Failure<bool>("EventNotFound", "Lifecycle event not found");

        if (lifecycleEvent.Status != ProcessingStatus.Pending)
            return Result.Failure<bool>("InvalidStatus", "Event is not in pending status");

        try
        {
            lifecycleEvent.Status = ProcessingStatus.Processing;
            await _lifecycleEventRepository.UpdateAsync(lifecycleEvent, cancellationToken);

            switch (lifecycleEvent.EventType)
            {
                case LifecycleEventType.Joiner:
                    await _lifecycleProcessor.ProcessJoinerAsync(lifecycleEvent, cancellationToken);
                    break;
                case LifecycleEventType.Mover:
                    await _lifecycleProcessor.ProcessMoverAsync(lifecycleEvent, cancellationToken);
                    break;
                case LifecycleEventType.Leaver:
                    await _lifecycleProcessor.ProcessLeaverAsync(lifecycleEvent, cancellationToken);
                    break;
            }

            lifecycleEvent.Status = ProcessingStatus.Completed;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;
            await _lifecycleEventRepository.UpdateAsync(lifecycleEvent, cancellationToken);

            return Result.Success(true);
        }
        catch (Exception ex)
        {
            lifecycleEvent.Status = ProcessingStatus.Failed;
            lifecycleEvent.ErrorMessage = ex.Message;
            await _lifecycleEventRepository.UpdateAsync(lifecycleEvent, cancellationToken);

            return Result.Failure<bool>("ProcessingFailed", ex.Message);
        }
    }
}
