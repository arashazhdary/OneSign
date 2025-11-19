using System.Text.Json;

namespace Onesign.Modules.Hunting.Application.DTOs;

public class HuntResultDto
{
    public List<JsonElement> Rows { get; set; } = new();
    public HuntResultMetaDto Meta { get; set; } = new();
    public long TotalApprox { get; set; }
}

public class HuntResultMetaDto
{
    public string Dataset { get; set; } = string.Empty;
    public DateTimeOffset QueryStartTime { get; set; }
    public DateTimeOffset QueryEndTime { get; set; }
    public int RowsScanned { get; set; }
    public int RowsReturned { get; set; }
    public double ExecutionTimeMs { get; set; }
    public List<string> ColumnsSelected { get; set; } = new();
    public string? SortColumn { get; set; }
    public string? SortDirection { get; set; }
}
