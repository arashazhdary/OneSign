using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Entities;

public class NotificationDeliveryLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OutboxItemId { get; set; }
    public NotificationChannel Channel { get; set; }

    public DeliveryStatus Status { get; set; }
    public string? ProviderMessageId { get; set; } // External provider tracking ID
    public string? ErrorDetails { get; set; }

    public DateTime Timestamp { get; set; }

    // Navigation
    public NotificationOutboxItem? OutboxItem { get; set; }
}
