namespace Onesign.Modules.Platform.Application.DTOs;

public class IntegrationTestResultDto
{
    public Guid Id { get; set; }
    public Guid TestSuiteId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public string? Category { get; set; }
    public double? DurationMs { get; set; }
}

public class TestSuiteResultDto
{
    public Guid TestSuiteId { get; set; }
    public int TotalTests { get; set; }
    public int Passed { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public double TotalDurationMs { get; set; }
    public List<IntegrationTestResultDto> Results { get; set; } = new();
}

public class PaginatedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
