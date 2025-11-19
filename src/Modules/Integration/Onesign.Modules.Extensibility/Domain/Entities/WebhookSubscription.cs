namespace Onesign.Modules.Extensibility.Domain.Entities;

public class WebhookSubscription
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public string EventTypesJson { get; set; } = "[]"; // JSON array of event types
    public bool IsEnabled { get; set; }
    public int MaxRetries { get; set; } = 3;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastDeliveryAt { get; set; }
    public string? LastDeliveryStatus { get; set; }
}
