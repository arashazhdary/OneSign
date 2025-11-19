namespace Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

public class IntegrationTestResultEntity
{
    public Guid Id { get; set; }
    public Guid TestSuiteId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public string? Category { get; set; }
}
