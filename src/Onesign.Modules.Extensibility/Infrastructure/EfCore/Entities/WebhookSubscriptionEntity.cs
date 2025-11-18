namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

public class WebhookSubscriptionEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public string EventTypesJson { get; set; } = "[]";
    public bool IsEnabled { get; set; }
    public int MaxRetries { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastDeliveryAt { get; set; }
    public string? LastDeliveryStatus { get; set; }
}
