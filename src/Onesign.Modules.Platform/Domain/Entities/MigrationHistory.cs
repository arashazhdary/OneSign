using Onesign.Modules.Platform.Domain.Enums;

namespace Onesign.Modules.Platform.Domain.Entities;

public class MigrationHistory
{
    public Guid Id { get; set; }
    public string MigrationName { get; set; } = string.Empty;
    public DateTimeOffset AppliedAt { get; set; }
    public Guid AppliedByUserId { get; set; }
    public MigrationStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public TimeSpan Duration { get; set; }
}
