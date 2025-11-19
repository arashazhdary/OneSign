namespace Onesign.Modules.Developer.Domain.Entities;

public class WebhookEndpoint
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty; // For HMAC signature verification
    public List<string> EventTypes { get; set; } = new(); // Events to subscribe to
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastTriggeredAt { get; set; }
    public int FailureCount { get; set; }
}
