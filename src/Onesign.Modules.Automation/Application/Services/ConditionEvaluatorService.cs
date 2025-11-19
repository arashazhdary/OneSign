using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Modules.Automation.Application.Services;

public class ConditionEvaluatorService : IConditionEvaluator
{
    private readonly ILogger<ConditionEvaluatorService> _logger;

    public ConditionEvaluatorService(ILogger<ConditionEvaluatorService> logger)
    {
        _logger = logger;
    }

    public bool Evaluate(ExpressionType expressionType, string expression, Dictionary<string, object?> payload)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(expression))
                return true;

            var doc = JsonDocument.Parse(expression);
            return EvaluateJsonLogic(doc.RootElement, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to evaluate condition expression: {Expression}", expression);
            return false;
        }
    }

    private bool EvaluateJsonLogic(JsonElement element, Dictionary<string, object?> payload)
    {
        if (element.ValueKind != JsonValueKind.Object)
            return false;

        foreach (var property in element.EnumerateObject())
        {
            var op = property.Name;
            var args = property.Value;

            return op switch
            {
                "all" or "and" => EvaluateAll(args, payload),
                "any" or "or" => EvaluateAny(args, payload),
                "==" => EvaluateEquals(args, payload),
                "!=" => EvaluateNotEquals(args, payload),
                ">" => EvaluateGreaterThan(args, payload),
                ">=" => EvaluateGreaterThanOrEqual(args, payload),
                "<" => EvaluateLessThan(args, payload),
                "<=" => EvaluateLessThanOrEqual(args, payload),
                "in" => EvaluateIn(args, payload),
                "not_in" => !EvaluateIn(args, payload),
                "!" or "not" => EvaluateNot(args, payload),
                "var" => GetValue(args, payload) != null,
                _ => false
            };
        }

        return false;
    }

    private bool EvaluateAll(JsonElement args, Dictionary<string, object?> payload)
    {
        if (args.ValueKind != JsonValueKind.Array)
            return false;

        foreach (var item in args.EnumerateArray())
        {
            if (!EvaluateJsonLogic(item, payload))
                return false;
        }

        return true;
    }

    private bool EvaluateAny(JsonElement args, Dictionary<string, object?> payload)
    {
        if (args.ValueKind != JsonValueKind.Array)
            return false;

        foreach (var item in args.EnumerateArray())
        {
            if (EvaluateJsonLogic(item, payload))
                return true;
        }

        return false;
    }

    private bool EvaluateEquals(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) == 0;
    }

    private bool EvaluateNotEquals(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) != 0;
    }

    private bool EvaluateGreaterThan(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) > 0;
    }

    private bool EvaluateGreaterThanOrEqual(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) >= 0;
    }

    private bool EvaluateLessThan(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) < 0;
    }

    private bool EvaluateLessThanOrEqual(JsonElement args, Dictionary<string, object?> payload)
    {
        var (left, right) = GetTwoArgs(args, payload);
        return CompareValues(left, right) <= 0;
    }

    private bool EvaluateIn(JsonElement args, Dictionary<string, object?> payload)
    {
        if (args.ValueKind != JsonValueKind.Array || args.GetArrayLength() < 2)
            return false;

        var items = args.EnumerateArray().ToList();
        var value = ResolveValue(items[0], payload);
        var list = items[1];

        if (list.ValueKind != JsonValueKind.Array)
            return false;

        foreach (var item in list.EnumerateArray())
        {
            var itemValue = ResolveValue(item, payload);
            if (CompareValues(value, itemValue) == 0)
                return true;
        }

        return false;
    }

    private bool EvaluateNot(JsonElement args, Dictionary<string, object?> payload)
    {
        if (args.ValueKind == JsonValueKind.Array && args.GetArrayLength() > 0)
        {
            return !EvaluateJsonLogic(args[0], payload);
        }
        return !EvaluateJsonLogic(args, payload);
    }

    private (object? left, object? right) GetTwoArgs(JsonElement args, Dictionary<string, object?> payload)
    {
        if (args.ValueKind != JsonValueKind.Array || args.GetArrayLength() < 2)
            return (null, null);

        var items = args.EnumerateArray().ToList();
        return (ResolveValue(items[0], payload), ResolveValue(items[1], payload));
    }

    private object? ResolveValue(JsonElement element, Dictionary<string, object?> payload)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Object when element.TryGetProperty("var", out var varElement) => GetValue(varElement, payload),
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.GetDecimal(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => null
        };
    }

    private object? GetValue(JsonElement varElement, Dictionary<string, object?> payload)
    {
        var path = varElement.ValueKind == JsonValueKind.String
            ? varElement.GetString()
            : varElement.ToString();

        if (string.IsNullOrEmpty(path))
            return null;

        var parts = path.Split('.');
        object? current = payload;

        foreach (var part in parts)
        {
            if (current == null)
                return null;

            if (current is Dictionary<string, object?> dict)
            {
                if (!dict.TryGetValue(part, out current))
                    return null;
            }
            else if (current is JsonElement jsonElement)
            {
                if (jsonElement.ValueKind == JsonValueKind.Object && jsonElement.TryGetProperty(part, out var prop))
                {
                    current = prop.ValueKind switch
                    {
                        JsonValueKind.String => prop.GetString(),
                        JsonValueKind.Number => prop.GetDecimal(),
                        JsonValueKind.True => true,
                        JsonValueKind.False => false,
                        JsonValueKind.Null => null,
                        _ => prop
                    };
                }
                else
                {
                    return null;
                }
            }
            else
            {
                var propInfo = current.GetType().GetProperty(part);
                if (propInfo == null)
                    return null;
                current = propInfo.GetValue(current);
            }
        }

        return current;
    }

    private int CompareValues(object? left, object? right)
    {
        if (left == null && right == null)
            return 0;
        if (left == null)
            return -1;
        if (right == null)
            return 1;

        if (left is decimal leftDecimal || right is decimal)
        {
            var leftNum = Convert.ToDecimal(left);
            var rightNum = Convert.ToDecimal(right);
            return leftNum.CompareTo(rightNum);
        }

        if (left is bool leftBool && right is bool rightBool)
        {
            return leftBool.CompareTo(rightBool);
        }

        return string.Compare(left.ToString(), right.ToString(), StringComparison.OrdinalIgnoreCase);
    }
}
