namespace Onesign.Shared.Platform.Entities;

public class PlatformVersion
{
    public Guid Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string ReleaseNotes { get; set; } = string.Empty;
    public DateTime ReleasedAt { get; set; }
    public bool IsCurrent { get; set; }
    public string? MinSupportedVersion { get; set; }
    public List<string> BreakingChanges { get; set; } = new();
    public List<string> NewFeatures { get; set; } = new();
    public List<string> BugFixes { get; set; } = new();
    public Dictionary<string, string> ModuleVersions { get; set; } = new();
}

public class MigrationHistory
{
    public Guid Id { get; set; }
    public string MigrationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public string AppliedBy { get; set; } = string.Empty;
    public TimeSpan ExecutionTime { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? RollbackScript { get; set; }
}

public class IntegrationTestResult
{
    public Guid Id { get; set; }
    public string TestSuiteId { get; set; } = string.Empty;
    public string TestSuiteName { get; set; } = string.Empty;
    public DateTime ExecutedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public int TotalTests { get; set; }
    public int PassedTests { get; set; }
    public int FailedTests { get; set; }
    public int SkippedTests { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ExecutedBy { get; set; }
    public List<TestCaseResult> TestCases { get; set; } = new();
    public Dictionary<string, string>? Environment { get; set; }
}

public class TestCaseResult
{
    public string TestName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
}
