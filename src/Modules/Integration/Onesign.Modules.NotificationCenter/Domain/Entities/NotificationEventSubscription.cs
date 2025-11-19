using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Entities;

public class NotificationEventSubscription
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty; // e.g., "user.created"
    public NotificationChannel Channel { get; set; }
    public Guid TemplateId { get; set; }

    // Recipient targeting
    public string RecipientSelector { get; set; } = string.Empty; // e.g., "user", "manager", "security_officers"

    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public NotificationTemplate? Template { get; set; }
}
