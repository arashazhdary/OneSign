using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class RetryNotificationCommandHandler : IRequestHandler<RetryNotificationCommand, Result>
{
    private readonly INotificationOutboxRepository _outboxRepository;

    public RetryNotificationCommandHandler(INotificationOutboxRepository outboxRepository)
    {
        _outboxRepository = outboxRepository;
    }

    public async Task<Result> Handle(RetryNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = await _outboxRepository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Notification not found");

        if (notification.Status != DeliveryStatus.Failed)
            return Result.Failure("InvalidState", "Only failed notifications can be retried");

        notification.Status = DeliveryStatus.Pending;
        notification.AttemptCount += 1;
        notification.NextRetryAt = DateTime.UtcNow;

        await _outboxRepository.UpdateAsync(notification, cancellationToken);
        return Result.Success();
    }
}
