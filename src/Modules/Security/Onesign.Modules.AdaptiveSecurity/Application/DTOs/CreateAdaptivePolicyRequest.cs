using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Application.DTOs;

public class CreateAdaptivePolicyRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Conditions { get; set; } = "{}";
    public List<AdaptiveActionType> Actions { get; set; } = new();
    public RiskLevel RiskThreshold { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
}
