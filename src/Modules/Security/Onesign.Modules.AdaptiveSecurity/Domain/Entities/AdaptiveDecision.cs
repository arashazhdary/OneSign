using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Entities;

public class AdaptiveDecision
{
    public bool IsAllowed { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public int RiskScore { get; set; }
    public List<AdaptiveActionType> RequiredActions { get; set; } = new();
    public string? Reason { get; set; }
    public Guid? MatchedPolicyId { get; set; }
}
