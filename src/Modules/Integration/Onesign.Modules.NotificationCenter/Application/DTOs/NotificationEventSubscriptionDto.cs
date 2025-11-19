namespace Onesign.Modules.NotificationCenter.Application.DTOs;

public class NotificationEventSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public Guid TemplateId { get; set; }
    public string? TemplateName { get; set; }
    public string RecipientSelector { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationEventSubscriptionRequest
{
    public string EventType { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public Guid TemplateId { get; set; }
    public string RecipientSelector { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}

public class UpdateNotificationEventSubscriptionRequest
{
    public Guid? TemplateId { get; set; }
    public string? RecipientSelector { get; set; }
    public bool? IsEnabled { get; set; }
}
