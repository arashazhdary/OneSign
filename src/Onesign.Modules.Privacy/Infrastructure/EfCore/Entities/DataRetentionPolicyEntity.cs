namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

public class DataRetentionPolicyEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int DataCategory { get; set; }
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
