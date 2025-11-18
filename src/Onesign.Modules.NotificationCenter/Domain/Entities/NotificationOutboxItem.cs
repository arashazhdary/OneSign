using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Entities;

public class NotificationOutboxItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public NotificationChannel Channel { get; set; }
    public NotificationPriority Priority { get; set; }

    // Recipient
    public string RecipientAddress { get; set; } = string.Empty; // email, phone, userId for InApp, URL for Webhook
    public Guid? RecipientUserId { get; set; }

    // Content
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;

    // Metadata
    public string EventType { get; set; } = string.Empty;
    public string ContextDataJson { get; set; } = "{}";

    // Delivery tracking
    public DeliveryStatus Status { get; set; }
    public int AttemptCount { get; set; }
    public DateTime? NextRetryAt { get; set; }
    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}
