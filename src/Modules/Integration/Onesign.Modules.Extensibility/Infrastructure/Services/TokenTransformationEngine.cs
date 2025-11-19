using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Domain.Services;

namespace Onesign.Modules.Extensibility.Infrastructure.Services;

public class TokenTransformationEngine : ITokenTransformationEngine
{
    private readonly ITokenTransformationRuleRepository _ruleRepository;
    private readonly ILogger<TokenTransformationEngine> _logger;

    public TokenTransformationEngine(
        ITokenTransformationRuleRepository ruleRepository,
        ILogger<TokenTransformationEngine> logger)
    {
        _ruleRepository = ruleRepository;
        _logger = logger;
    }

    public async Task<TokenTransformationResult> TransformClaimsAsync(
        Guid tenantId,
        Guid? applicationId,
        Dictionary<string, object> inputClaims,
        CancellationToken cancellationToken = default)
    {
        var result = new TokenTransformationResult
        {
            IsSuccess = true,
            TransformedClaims = new Dictionary<string, object>(inputClaims)
        };

        // Get applicable rules
        var rules = await _ruleRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var applicableRules = rules
            .Where(r => r.IsEnabled && (r.TargetAppId == null || r.TargetAppId == applicationId))
            .OrderBy(r => r.Order)
            .ToList();

        if (!applicableRules.Any())
        {
            return result;
        }

        foreach (var rule in applicableRules)
        {
            try
            {
                var ruleDefinition = JsonSerializer.Deserialize<RuleDefinition>(rule.RuleDefinitionJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (ruleDefinition == null)
                    continue;

                ApplyRule(ruleDefinition, result.TransformedClaims);
                result.AppliedRules.Add(rule.Name);

                _logger.LogDebug("Applied transformation rule {RuleName} for tenant {TenantId}",
                    rule.Name, tenantId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to apply rule {RuleId}", rule.Id);
                result.Errors.Add($"Rule {rule.Name} failed: {ex.Message}");
            }
        }

        _logger.LogInformation("Applied {Count} transformation rules for tenant {TenantId}, app {AppId}",
            result.AppliedRules.Count, tenantId, applicationId);

        return result;
    }

    public async Task<IReadOnlyList<string>> ValidateRulesAsync(
        Guid tenantId,
        Guid? applicationId,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<string>();

        var rules = await _ruleRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var applicableRules = rules
            .Where(r => r.IsEnabled && (r.TargetAppId == null || r.TargetAppId == applicationId))
            .ToList();

        foreach (var rule in applicableRules)
        {
            try
            {
                var ruleDefinition = JsonSerializer.Deserialize<RuleDefinition>(rule.RuleDefinitionJson);
                if (ruleDefinition == null)
                {
                    errors.Add($"Rule {rule.Name}: Invalid JSON format");
                    continue;
                }

                if (string.IsNullOrEmpty(ruleDefinition.Action))
                {
                    errors.Add($"Rule {rule.Name}: Missing action");
                }

                if (ruleDefinition.Action == "map" && string.IsNullOrEmpty(ruleDefinition.SourceClaim))
                {
                    errors.Add($"Rule {rule.Name}: Map action requires source claim");
                }

                if ((ruleDefinition.Action == "map" || ruleDefinition.Action == "set") &&
                    string.IsNullOrEmpty(ruleDefinition.TargetClaim))
                {
                    errors.Add($"Rule {rule.Name}: Action requires target claim");
                }
            }
            catch (JsonException ex)
            {
                errors.Add($"Rule {rule.Name}: Invalid JSON - {ex.Message}");
            }
        }

        return errors;
    }

    private void ApplyRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        switch (rule.Action?.ToLowerInvariant())
        {
            case "map":
                ApplyMapRule(rule, claims);
                break;

            case "set":
                ApplySetRule(rule, claims);
                break;

            case "remove":
                ApplyRemoveRule(rule, claims);
                break;

            case "rename":
                ApplyRenameRule(rule, claims);
                break;

            case "transform":
                ApplyTransformRule(rule, claims);
                break;

            default:
                _logger.LogWarning("Unknown transformation action: {Action}", rule.Action);
                break;
        }
    }

    private void ApplyMapRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        if (string.IsNullOrEmpty(rule.SourceClaim) || string.IsNullOrEmpty(rule.TargetClaim))
            return;

        if (claims.TryGetValue(rule.SourceClaim, out var value))
        {
            claims[rule.TargetClaim] = value;
        }
    }

    private void ApplySetRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        if (string.IsNullOrEmpty(rule.TargetClaim) || rule.Value == null)
            return;

        claims[rule.TargetClaim] = rule.Value;
    }

    private void ApplyRemoveRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        if (string.IsNullOrEmpty(rule.TargetClaim))
            return;

        claims.Remove(rule.TargetClaim);
    }

    private void ApplyRenameRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        if (string.IsNullOrEmpty(rule.SourceClaim) || string.IsNullOrEmpty(rule.TargetClaim))
            return;

        if (claims.TryGetValue(rule.SourceClaim, out var value))
        {
            claims.Remove(rule.SourceClaim);
            claims[rule.TargetClaim] = value;
        }
    }

    private void ApplyTransformRule(RuleDefinition rule, Dictionary<string, object> claims)
    {
        if (string.IsNullOrEmpty(rule.SourceClaim) || string.IsNullOrEmpty(rule.TargetClaim))
            return;

        if (!claims.TryGetValue(rule.SourceClaim, out var value))
            return;

        var transformedValue = rule.Transformation?.ToLowerInvariant() switch
        {
            "uppercase" => value?.ToString()?.ToUpperInvariant(),
            "lowercase" => value?.ToString()?.ToLowerInvariant(),
            "trim" => value?.ToString()?.Trim(),
            "split" => value?.ToString()?.Split(rule.Delimiter ?? ",").ToList(),
            "join" => value is IEnumerable<object> list ? string.Join(rule.Delimiter ?? ",", list) : value,
            "prefix" => $"{rule.Prefix}{value}",
            "suffix" => $"{value}{rule.Suffix}",
            _ => value
        };

        if (transformedValue != null)
        {
            claims[rule.TargetClaim] = transformedValue;
        }
    }

    private class RuleDefinition
    {
        public string? Action { get; set; }
        public string? SourceClaim { get; set; }
        public string? TargetClaim { get; set; }
        public object? Value { get; set; }
        public string? Transformation { get; set; }
        public string? Delimiter { get; set; }
        public string? Prefix { get; set; }
        public string? Suffix { get; set; }
        public string? Condition { get; set; }
    }
}
