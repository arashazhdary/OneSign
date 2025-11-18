using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Entities;

public class WebhookDeliveryLog
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public WebhookDeliveryStatus Status { get; set; }
    public int AttemptCount { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public int? ResponseStatusCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}
