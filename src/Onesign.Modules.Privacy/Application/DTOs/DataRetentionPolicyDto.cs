namespace Onesign.Modules.Privacy.Application.DTOs;

public class DataRetentionPolicyDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string DataCategory { get; set; } = string.Empty;
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
