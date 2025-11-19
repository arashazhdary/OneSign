using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetNotificationEventSubscriptionsQueryHandler : IRequestHandler<GetNotificationEventSubscriptionsQuery, Result<List<NotificationEventSubscriptionDto>>>
{
    private readonly INotificationEventSubscriptionRepository _subscriptionRepository;
    private readonly INotificationTemplateRepository _templateRepository;

    public GetNotificationEventSubscriptionsQueryHandler(
        INotificationEventSubscriptionRepository subscriptionRepository,
        INotificationTemplateRepository templateRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<List<NotificationEventSubscriptionDto>>> Handle(GetNotificationEventSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        var subscriptions = string.IsNullOrEmpty(request.EventType)
            ? await _subscriptionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken)
            : await _subscriptionRepository.GetByEventTypeAsync(request.TenantId, request.EventType, cancellationToken);

        var templates = await _templateRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var templateDict = templates.ToDictionary(t => t.Id, t => t.Name);

        var dtos = subscriptions.Select(subscription => new NotificationEventSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            EventType = subscription.EventType,
            Channel = subscription.Channel.ToString(),
            TemplateId = subscription.TemplateId,
            TemplateName = templateDict.TryGetValue(subscription.TemplateId, out var name) ? name : null,
            RecipientSelector = subscription.RecipientSelector,
            IsEnabled = subscription.IsEnabled,
            CreatedAt = subscription.CreatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
