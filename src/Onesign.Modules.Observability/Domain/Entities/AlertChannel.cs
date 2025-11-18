using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Domain.Entities;

public class AlertChannel
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AlertChannelType Type { get; set; }

    // Configuration varies by type
    public string ConfigJson { get; set; } = string.Empty; // Email addresses, webhook URL, headers, etc.

    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
