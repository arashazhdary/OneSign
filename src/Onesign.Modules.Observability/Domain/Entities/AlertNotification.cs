namespace Onesign.Modules.Observability.Domain.Entities;

public class AlertNotification
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid AlertRuleId { get; set; }
    public Guid AlertChannelId { get; set; }

    public string Message { get; set; } = string.Empty;
    public string DataJson { get; set; } = string.Empty; // Details about the triggered rule

    public bool IsRead { get; set; }
    public DateTime TriggeredAt { get; set; }
    public DateTime? ReadAt { get; set; }

    public AlertRule? AlertRule { get; set; }
    public AlertChannel? AlertChannel { get; set; }
}
