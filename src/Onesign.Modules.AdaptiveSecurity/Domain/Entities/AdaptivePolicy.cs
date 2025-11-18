using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Entities;

public class AdaptivePolicy
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Conditions { get; set; } = "{}"; // JSON - rules for when to trigger
    public List<AdaptiveActionType> Actions { get; set; } = new();
    public RiskLevel RiskThreshold { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
