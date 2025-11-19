using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Domain.Entities;

public class AlertRule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public AlertRuleType Type { get; set; }
    public string MetricKey { get; set; } = string.Empty; // e.g. "Auth.LoginFailed", "Security.RiskEvent.High"
    public int Threshold { get; set; }
    public TimeSpan Window { get; set; } // 5 minutes, 1 hour, etc.

    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Guid> ChannelIds { get; set; } = new List<Guid>(); // Alert channels to notify
}
