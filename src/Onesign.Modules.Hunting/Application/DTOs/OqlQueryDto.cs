namespace Onesign.Modules.Hunting.Application.DTOs;

public class OqlQueryDto
{
    public string Dataset { get; set; } = string.Empty;
    public OqlTimeRangeDto? TimeRange { get; set; }
    public OqlFilterDto? Filter { get; set; }
    public List<string>? Select { get; set; }
    public OqlSortDto? Sort { get; set; }
    public int? Limit { get; set; }
}

public class OqlTimeRangeDto
{
    public DateTimeOffset? Start { get; set; }
    public DateTimeOffset? End { get; set; }
    public string? RelativeTime { get; set; }
}

public class OqlFilterDto
{
    public string? Operator { get; set; }
    public List<OqlFilterDto>? Conditions { get; set; }
    public string? Field { get; set; }
    public string? Op { get; set; }
    public object? Value { get; set; }
}

public class OqlSortDto
{
    public string Column { get; set; } = string.Empty;
    public string Direction { get; set; } = "desc";
}
