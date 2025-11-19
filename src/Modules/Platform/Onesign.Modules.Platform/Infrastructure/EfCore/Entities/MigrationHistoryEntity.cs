namespace Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

public class MigrationHistoryEntity
{
    public Guid Id { get; set; }
    public string MigrationName { get; set; } = string.Empty;
    public DateTimeOffset AppliedAt { get; set; }
    public Guid AppliedByUserId { get; set; }
    public int Status { get; set; }
    public string? ErrorMessage { get; set; }
    public long DurationTicks { get; set; }
}
