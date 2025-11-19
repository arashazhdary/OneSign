using Onesign.Modules.Platform.Domain.Enums;

namespace Onesign.Modules.Platform.Domain.Entities;

public class IntegrationTestResult
{
    public Guid Id { get; set; }
    public Guid TestSuiteId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public TestStatus Status { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public string? Category { get; set; }
}
