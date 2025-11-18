namespace Onesign.Modules.Extensibility.Application.DTOs;

public class WebhookSubscriptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string EventTypesJson { get; set; } = "[]";
    public bool IsEnabled { get; set; }
    public int MaxRetries { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastDeliveryAt { get; set; }
    public string? LastDeliveryStatus { get; set; }
}

public class LoginHookDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; }
    public bool FailOpen { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
