namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

public class NotificationOutboxItemEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int Channel { get; set; }
    public int Priority { get; set; }
    public string RecipientAddress { get; set; } = string.Empty;
    public Guid? RecipientUserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string ContextDataJson { get; set; } = "{}";
    public int Status { get; set; }
    public int AttemptCount { get; set; }
    public DateTime? NextRetryAt { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}
