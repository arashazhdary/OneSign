namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

public class NotificationEventSubscriptionEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public int Channel { get; set; }
    public Guid TemplateId { get; set; }
    public string RecipientSelector { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }

    public NotificationTemplateEntity? Template { get; set; }
}
