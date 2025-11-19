using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Services;

public class OqlParser : IOqlParser
{
    private readonly ILogger<OqlParser> _logger;

    private static readonly HashSet<string> ValidOperators = new(StringComparer.OrdinalIgnoreCase)
    {
        "and", "or", "not"
    };

    private static readonly HashSet<string> ValidComparisonOps = new(StringComparer.OrdinalIgnoreCase)
    {
        "eq", "neq", "gt", "gte", "lt", "lte", "contains", "startswith", "endswith", "in", "notin", "exists", "regex"
    };

    public OqlParser(ILogger<OqlParser> logger)
    {
        _logger = logger;
    }

    public Result<OqlQueryDto> Parse(string queryDslJson)
    {
        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var query = JsonSerializer.Deserialize<OqlQueryDto>(queryDslJson, options);
            if (query == null)
            {
                return Result.Failure<OqlQueryDto>("ParseError", "Failed to parse query JSON");
            }

            return Result.Success(query);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse OQL query JSON");
            return Result.Failure<OqlQueryDto>("ParseError", $"Invalid JSON format: {ex.Message}");
        }
    }

    public Result ValidateQuery(OqlQueryDto query)
    {
        if (string.IsNullOrWhiteSpace(query.Dataset))
        {
            return Result.Failure("ValidationError", "Dataset is required");
        }

        var dataset = ParseDataset(query.Dataset);
        if (dataset == null)
        {
            return Result.Failure("ValidationError", $"Invalid dataset: {query.Dataset}");
        }

        if (query.Filter != null)
        {
            var filterValidation = ValidateFilter(query.Filter);
            if (filterValidation.IsFailure)
            {
                return filterValidation;
            }
        }

        if (query.Limit.HasValue && (query.Limit.Value < 1 || query.Limit.Value > 100000))
        {
            return Result.Failure("ValidationError", "Limit must be between 1 and 100000");
        }

        if (query.Sort != null)
        {
            if (string.IsNullOrWhiteSpace(query.Sort.Column))
            {
                return Result.Failure("ValidationError", "Sort column is required");
            }

            if (!string.Equals(query.Sort.Direction, "asc", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(query.Sort.Direction, "desc", StringComparison.OrdinalIgnoreCase))
            {
                return Result.Failure("ValidationError", "Sort direction must be 'asc' or 'desc'");
            }
        }

        return Result.Success();
    }

    public HuntDataset? ParseDataset(string datasetName)
    {
        return datasetName.ToLowerInvariant() switch
        {
            "signinevents" or "signin" => HuntDataset.SignInEvents,
            "accesschangeevents" or "accesschange" => HuntDataset.AccessChangeEvents,
            "privilegedaccessevents" or "privilegedaccess" => HuntDataset.PrivilegedAccessEvents,
            "policydecisionevents" or "policydecision" => HuntDataset.PolicyDecisionEvents,
            "automationexecutionevents" or "automationexecution" => HuntDataset.AutomationExecutionEvents,
            "changesetevents" or "changeset" => HuntDataset.ChangeSetEvents,
            "incidentevents" or "incident" => HuntDataset.IncidentEvents,
            _ => null
        };
    }

    public (DateTimeOffset Start, DateTimeOffset End) ResolveTimeRange(OqlTimeRangeDto? timeRange)
    {
        if (timeRange == null)
        {
            return (DateTimeOffset.UtcNow.AddHours(-24), DateTimeOffset.UtcNow);
        }

        if (timeRange.Start.HasValue && timeRange.End.HasValue)
        {
            return (timeRange.Start.Value, timeRange.End.Value);
        }

        if (!string.IsNullOrWhiteSpace(timeRange.RelativeTime))
        {
            var end = DateTimeOffset.UtcNow;
            var start = ParseRelativeTime(timeRange.RelativeTime, end);
            return (start, end);
        }

        var defaultEnd = DateTimeOffset.UtcNow;
        var defaultStart = timeRange.Start ?? defaultEnd.AddHours(-24);
        return (defaultStart, timeRange.End ?? defaultEnd);
    }

    private Result ValidateFilter(OqlFilterDto filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Operator))
        {
            if (!ValidOperators.Contains(filter.Operator))
            {
                return Result.Failure("ValidationError", $"Invalid logical operator: {filter.Operator}");
            }

            if (filter.Conditions == null || filter.Conditions.Count == 0)
            {
                return Result.Failure("ValidationError", "Logical operator requires conditions");
            }

            foreach (var condition in filter.Conditions)
            {
                var result = ValidateFilter(condition);
                if (result.IsFailure)
                {
                    return result;
                }
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(filter.Field))
            {
                return Result.Failure("ValidationError", "Filter field is required");
            }

            if (string.IsNullOrWhiteSpace(filter.Op))
            {
                return Result.Failure("ValidationError", "Filter operation is required");
            }

            if (!ValidComparisonOps.Contains(filter.Op))
            {
                return Result.Failure("ValidationError", $"Invalid comparison operator: {filter.Op}");
            }

            if (filter.Op != "exists" && filter.Value == null)
            {
                return Result.Failure("ValidationError", $"Value is required for operation: {filter.Op}");
            }
        }

        return Result.Success();
    }

    private static DateTimeOffset ParseRelativeTime(string relativeTime, DateTimeOffset reference)
    {
        var normalized = relativeTime.Trim().ToLowerInvariant();

        if (normalized.StartsWith("last"))
        {
            normalized = normalized.Substring(4).Trim();
        }

        if (normalized.EndsWith("m") || normalized.EndsWith("min") || normalized.EndsWith("minutes"))
        {
            var value = ExtractNumericValue(normalized);
            return reference.AddMinutes(-value);
        }

        if (normalized.EndsWith("h") || normalized.EndsWith("hour") || normalized.EndsWith("hours"))
        {
            var value = ExtractNumericValue(normalized);
            return reference.AddHours(-value);
        }

        if (normalized.EndsWith("d") || normalized.EndsWith("day") || normalized.EndsWith("days"))
        {
            var value = ExtractNumericValue(normalized);
            return reference.AddDays(-value);
        }

        if (normalized.EndsWith("w") || normalized.EndsWith("week") || normalized.EndsWith("weeks"))
        {
            var value = ExtractNumericValue(normalized);
            return reference.AddDays(-value * 7);
        }

        return reference.AddHours(-24);
    }

    private static int ExtractNumericValue(string input)
    {
        var numericPart = new string(input.Where(char.IsDigit).ToArray());
        return int.TryParse(numericPart, out var value) ? value : 1;
    }
}
