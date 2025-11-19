namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

public class AdaptivePolicyEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Conditions { get; set; } = "{}";
    public string ActionsJson { get; set; } = "[]"; // Serialized list of AdaptiveActionType
    public int RiskThreshold { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
