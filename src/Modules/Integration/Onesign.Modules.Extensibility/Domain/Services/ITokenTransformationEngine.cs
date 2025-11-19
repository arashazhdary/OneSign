namespace Onesign.Modules.Extensibility.Domain.Services;

public interface ITokenTransformationEngine
{
    Task<TokenTransformationResult> TransformClaimsAsync(
        Guid tenantId,
        Guid? applicationId,
        Dictionary<string, object> inputClaims,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> ValidateRulesAsync(
        Guid tenantId,
        Guid? applicationId,
        CancellationToken cancellationToken = default);
}

public class TokenTransformationResult
{
    public bool IsSuccess { get; set; }
    public Dictionary<string, object> TransformedClaims { get; set; } = new();
    public List<string> AppliedRules { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
