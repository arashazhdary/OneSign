using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Services;

public interface IPolicyEvaluationService
{
    Task<PolicyEvaluationResult> EvaluateAsync(
        Guid tenantId,
        Guid userId,
        Guid? clientId,
        string targetKey,
        PolicyTargetType targetType,
        Dictionary<string, object>? context = null,
        CancellationToken cancellationToken = default);
}

public class PolicyEvaluationResult
{
    public bool IsAllowed { get; set; }
    public List<string> MatchedPolicies { get; set; } = new();
    public List<string> AllowedScopes { get; set; } = new();
    public List<string> DeniedScopes { get; set; } = new();
    public string? DenyReason { get; set; }
}
