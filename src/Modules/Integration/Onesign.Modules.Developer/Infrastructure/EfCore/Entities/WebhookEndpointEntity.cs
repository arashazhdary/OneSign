namespace Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

public class WebhookEndpointEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string EventTypesJson { get; set; } = string.Empty; // JSON array
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastTriggeredAt { get; set; }
    public int FailureCount { get; set; }
}
