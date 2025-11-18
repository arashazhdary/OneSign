using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Entities;

public class NotificationChannelConfig
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public NotificationChannel Channel { get; set; }
    public bool IsEnabled { get; set; }

    // Configuration (stored as JSON)
    // For Email: SMTP settings
    // For SMS: provider API keys
    // For Webhook: default headers
    public string ConfigurationJson { get; set; } = "{}";

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
