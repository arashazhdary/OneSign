using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class CancelNotificationCommandHandler : IRequestHandler<CancelNotificationCommand, Result>
{
    private readonly INotificationOutboxRepository _outboxRepository;

    public CancelNotificationCommandHandler(INotificationOutboxRepository outboxRepository)
    {
        _outboxRepository = outboxRepository;
    }

    public async Task<Result> Handle(CancelNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = await _outboxRepository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Notification not found");

        if (notification.Status == DeliveryStatus.Delivered)
            return Result.Failure("InvalidState", "Cannot cancel delivered notification");

        notification.Status = DeliveryStatus.Cancelled;

        await _outboxRepository.UpdateAsync(notification, cancellationToken);
        return Result.Success();
    }
}
