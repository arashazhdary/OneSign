using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class UpdateNotificationEventSubscriptionCommandHandler : IRequestHandler<UpdateNotificationEventSubscriptionCommand, Result<NotificationEventSubscriptionDto>>
{
    private readonly INotificationEventSubscriptionRepository _subscriptionRepository;
    private readonly INotificationTemplateRepository _templateRepository;

    public UpdateNotificationEventSubscriptionCommandHandler(
        INotificationEventSubscriptionRepository subscriptionRepository,
        INotificationTemplateRepository templateRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<NotificationEventSubscriptionDto>> Handle(UpdateNotificationEventSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(request.SubscriptionId, cancellationToken);
        if (subscription == null || subscription.TenantId != request.TenantId)
            return Result.Failure<NotificationEventSubscriptionDto>("NotFound", "Subscription not found");

        string? templateName = null;
        if (request.TemplateId.HasValue)
        {
            var template = await _templateRepository.GetByIdAsync(request.TemplateId.Value, cancellationToken);
            if (template == null || template.TenantId != request.TenantId)
                return Result.Failure<NotificationEventSubscriptionDto>("TemplateNotFound", "Template not found");
            subscription.TemplateId = request.TemplateId.Value;
            templateName = template.Name;
        }
        else
        {
            var template = await _templateRepository.GetByIdAsync(subscription.TemplateId, cancellationToken);
            templateName = template?.Name;
        }

        if (request.RecipientSelector != null)
            subscription.RecipientSelector = request.RecipientSelector;
        if (request.IsEnabled.HasValue)
            subscription.IsEnabled = request.IsEnabled.Value;

        await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);

        var dto = new NotificationEventSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            EventType = subscription.EventType,
            Channel = subscription.Channel.ToString(),
            TemplateId = subscription.TemplateId,
            TemplateName = templateName,
            RecipientSelector = subscription.RecipientSelector,
            IsEnabled = subscription.IsEnabled,
            CreatedAt = subscription.CreatedAt
        };

        return Result.Success(dto);
    }
}
