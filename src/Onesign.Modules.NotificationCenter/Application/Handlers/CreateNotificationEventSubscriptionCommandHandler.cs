using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class CreateNotificationEventSubscriptionCommandHandler : IRequestHandler<CreateNotificationEventSubscriptionCommand, Result<NotificationEventSubscriptionDto>>
{
    private readonly INotificationEventSubscriptionRepository _subscriptionRepository;
    private readonly INotificationTemplateRepository _templateRepository;

    public CreateNotificationEventSubscriptionCommandHandler(
        INotificationEventSubscriptionRepository subscriptionRepository,
        INotificationTemplateRepository templateRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<NotificationEventSubscriptionDto>> Handle(CreateNotificationEventSubscriptionCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
            return Result.Failure<NotificationEventSubscriptionDto>("InvalidChannel", "Invalid notification channel");

        var template = await _templateRepository.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template == null || template.TenantId != request.TenantId)
            return Result.Failure<NotificationEventSubscriptionDto>("TemplateNotFound", "Template not found");

        var subscription = new NotificationEventSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            EventType = request.EventType,
            Channel = channel,
            TemplateId = request.TemplateId,
            RecipientSelector = request.RecipientSelector,
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow
        };

        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        var dto = new NotificationEventSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            EventType = subscription.EventType,
            Channel = subscription.Channel.ToString(),
            TemplateId = subscription.TemplateId,
            TemplateName = template.Name,
            RecipientSelector = subscription.RecipientSelector,
            IsEnabled = subscription.IsEnabled,
            CreatedAt = subscription.CreatedAt
        };

        return Result.Success(dto);
    }
}
