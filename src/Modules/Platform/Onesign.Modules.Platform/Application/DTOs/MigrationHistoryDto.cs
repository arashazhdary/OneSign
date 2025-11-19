namespace Onesign.Modules.Platform.Application.DTOs;

public class MigrationHistoryDto
{
    public Guid Id { get; set; }
    public string MigrationName { get; set; } = string.Empty;
    public DateTimeOffset AppliedAt { get; set; }
    public Guid AppliedByUserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public double DurationMs { get; set; }
}
