using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;

namespace Onesign.Modules.NotificationCenter.Application.Services;

public class NotificationRouterService : INotificationRouter
{
    private readonly INotificationEventSubscriptionRepository _subscriptionRepository;
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly INotificationOutboxRepository _outboxRepository;

    public NotificationRouterService(
        INotificationEventSubscriptionRepository subscriptionRepository,
        INotificationTemplateRepository templateRepository,
        INotificationOutboxRepository outboxRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _templateRepository = templateRepository;
        _outboxRepository = outboxRepository;
    }

    public async Task RouteEventAsync(Guid tenantId, string eventType, Dictionary<string, object> context, CancellationToken cancellationToken = default)
    {
        var subscriptions = await _subscriptionRepository.GetByEventTypeAsync(tenantId, eventType, cancellationToken);

        foreach (var subscription in subscriptions)
        {
            var template = subscription.Template ?? await _templateRepository.GetByIdAsync(subscription.TemplateId, cancellationToken);

            if (template == null || !template.IsEnabled)
                continue;

            var recipientAddress = ResolveRecipient(subscription.RecipientSelector, context);
            if (string.IsNullOrEmpty(recipientAddress))
                continue;

            var subject = RenderTemplate(template.SubjectTemplate, context);
            var body = RenderTemplate(template.BodyTemplate, context);

            var outboxItem = new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = subscription.Channel,
                Priority = NotificationPriority.Normal,
                RecipientAddress = recipientAddress,
                RecipientUserId = context.ContainsKey("UserId") ? (Guid?)context["UserId"] : null,
                Subject = subject,
                Body = body,
                EventType = eventType,
                ContextDataJson = System.Text.Json.JsonSerializer.Serialize(context),
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _outboxRepository.AddAsync(outboxItem, cancellationToken);
        }
    }

    private string ResolveRecipient(string selector, Dictionary<string, object> context)
    {
        // Simple implementation - can be extended
        if (selector == "user" && context.ContainsKey("UserEmail"))
            return context["UserEmail"].ToString() ?? string.Empty;

        if (selector == "manager" && context.ContainsKey("ManagerEmail"))
            return context["ManagerEmail"].ToString() ?? string.Empty;

        return string.Empty;
    }

    private string RenderTemplate(string template, Dictionary<string, object> context)
    {
        // Simple template rendering - replace {{key}} with context values
        var result = template;
        foreach (var kvp in context)
        {
            result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? string.Empty);
        }
        return result;
    }
}
