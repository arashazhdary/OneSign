using System.Text.Json;
using System.Text.RegularExpressions;
using Onesign.Modules.Hunting.Application.DTOs;

namespace Onesign.Modules.Hunting.Application.Services;

public static class DatasetQueryHelper
{
    public static bool EvaluateFilter(Dictionary<string, object> item, OqlFilterDto? filter)
    {
        if (filter == null) return true;

        if (!string.IsNullOrWhiteSpace(filter.Operator))
        {
            var op = filter.Operator.ToLowerInvariant();
            var results = filter.Conditions?.Select(c => EvaluateFilter(item, c)).ToList() ?? new List<bool>();

            return op switch
            {
                "and" => results.All(r => r),
                "or" => results.Any(r => r),
                "not" => results.Count > 0 && !results[0],
                _ => true
            };
        }

        if (string.IsNullOrWhiteSpace(filter.Field) || string.IsNullOrWhiteSpace(filter.Op))
            return true;

        var fieldValue = GetFieldValue(item, filter.Field);
        return EvaluateCondition(fieldValue, filter.Op, filter.Value);
    }

    public static JsonElement SelectColumns(Dictionary<string, object> item, List<string>? columns)
    {
        Dictionary<string, object> selected;

        if (columns == null || columns.Count == 0)
        {
            selected = item;
        }
        else
        {
            selected = new Dictionary<string, object>();
            foreach (var column in columns)
            {
                var value = GetFieldValue(item, column);
                if (value != null)
                {
                    selected[column] = value;
                }
            }
        }

        var json = JsonSerializer.Serialize(selected);
        return JsonDocument.Parse(json).RootElement.Clone();
    }

    public static List<JsonElement> ApplySort(List<JsonElement> rows, OqlSortDto sort)
    {
        var direction = string.Equals(sort.Direction, "asc", StringComparison.OrdinalIgnoreCase) ? 1 : -1;

        return rows.OrderBy(row =>
        {
            if (row.TryGetProperty(sort.Column, out var prop))
            {
                return prop.ValueKind switch
                {
                    JsonValueKind.String => prop.GetString() as IComparable,
                    JsonValueKind.Number => prop.GetDouble() as IComparable,
                    JsonValueKind.True or JsonValueKind.False => prop.GetBoolean() as IComparable,
                    _ => null
                };
            }
            return null;
        }, direction == 1 ? Comparer<IComparable?>.Default : Comparer<IComparable?>.Create((a, b) => Comparer<IComparable?>.Default.Compare(b, a)))
        .ToList();
    }

    private static object? GetFieldValue(Dictionary<string, object> item, string field)
    {
        var parts = field.Split('.');
        object? current = item;

        foreach (var part in parts)
        {
            if (current is Dictionary<string, object> dict)
            {
                if (!dict.TryGetValue(part, out current))
                    return null;
            }
            else
            {
                return null;
            }
        }

        return current;
    }

    private static bool EvaluateCondition(object? fieldValue, string op, object? filterValue)
    {
        var normalizedOp = op.ToLowerInvariant();

        if (normalizedOp == "exists")
        {
            return fieldValue != null;
        }

        if (fieldValue == null)
            return normalizedOp == "neq";

        switch (normalizedOp)
        {
            case "eq":
                return AreEqual(fieldValue, filterValue);

            case "neq":
                return !AreEqual(fieldValue, filterValue);

            case "gt":
                return Compare(fieldValue, filterValue) > 0;

            case "gte":
                return Compare(fieldValue, filterValue) >= 0;

            case "lt":
                return Compare(fieldValue, filterValue) < 0;

            case "lte":
                return Compare(fieldValue, filterValue) <= 0;

            case "contains":
                return fieldValue.ToString()?.Contains(filterValue?.ToString() ?? "", StringComparison.OrdinalIgnoreCase) ?? false;

            case "startswith":
                return fieldValue.ToString()?.StartsWith(filterValue?.ToString() ?? "", StringComparison.OrdinalIgnoreCase) ?? false;

            case "endswith":
                return fieldValue.ToString()?.EndsWith(filterValue?.ToString() ?? "", StringComparison.OrdinalIgnoreCase) ?? false;

            case "in":
                return IsIn(fieldValue, filterValue);

            case "notin":
                return !IsIn(fieldValue, filterValue);

            case "regex":
                try
                {
                    return Regex.IsMatch(fieldValue.ToString() ?? "", filterValue?.ToString() ?? "", RegexOptions.IgnoreCase);
                }
                catch
                {
                    return false;
                }

            default:
                return true;
        }
    }

    private static bool AreEqual(object? a, object? b)
    {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;

        var aStr = a.ToString();
        var bStr = b.ToString();

        if (string.Equals(aStr, bStr, StringComparison.OrdinalIgnoreCase))
            return true;

        if (a is IComparable ac && b is IComparable bc)
        {
            try
            {
                return ac.CompareTo(Convert.ChangeType(b, a.GetType())) == 0;
            }
            catch
            {
                return false;
            }
        }

        return false;
    }

    private static int Compare(object? a, object? b)
    {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;

        if (a is DateTimeOffset adt && b is string bStr && DateTimeOffset.TryParse(bStr, out var bdt))
        {
            return adt.CompareTo(bdt);
        }

        if (a is IComparable ac)
        {
            try
            {
                var converted = Convert.ChangeType(b, a.GetType());
                return ac.CompareTo(converted);
            }
            catch
            {
                return string.Compare(a.ToString(), b.ToString(), StringComparison.OrdinalIgnoreCase);
            }
        }

        return string.Compare(a.ToString(), b.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsIn(object? fieldValue, object? filterValue)
    {
        if (filterValue is JsonElement je && je.ValueKind == JsonValueKind.Array)
        {
            return je.EnumerateArray().Any(item =>
            {
                var itemStr = item.ValueKind == JsonValueKind.String ? item.GetString() : item.ToString();
                return string.Equals(fieldValue?.ToString(), itemStr, StringComparison.OrdinalIgnoreCase);
            });
        }

        if (filterValue is IEnumerable<object> list)
        {
            return list.Any(item => string.Equals(fieldValue?.ToString(), item?.ToString(), StringComparison.OrdinalIgnoreCase));
        }

        return false;
    }
}
