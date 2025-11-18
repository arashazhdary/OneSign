using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Entities;

public class DataRetentionPolicy
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DataCategory DataCategory { get; set; }
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
