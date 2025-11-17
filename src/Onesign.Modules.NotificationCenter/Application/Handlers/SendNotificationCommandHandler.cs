using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class SendNotificationCommandHandler : IRequestHandler<SendNotificationCommand, Result<Guid>>
{
    private readonly INotificationOutboxRepository _outboxRepository;

    public SendNotificationCommandHandler(INotificationOutboxRepository outboxRepository)
    {
        _outboxRepository = outboxRepository;
    }

    public async Task<Result<Guid>> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
            return Result.Failure<Guid>("Invalid channel");

        if (!Enum.TryParse<NotificationPriority>(request.Priority, true, out var priority))
            priority = NotificationPriority.Normal;

        var outboxItem = new NotificationOutboxItem
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Channel = channel,
            Priority = priority,
            RecipientAddress = request.RecipientAddress,
            RecipientUserId = request.RecipientUserId,
            Subject = request.Subject,
            Body = request.Body,
            EventType = "manual.notification",
            Status = DeliveryStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _outboxRepository.AddAsync(outboxItem, cancellationToken);

        return Result.Success(outboxItem.Id);
    }
}
