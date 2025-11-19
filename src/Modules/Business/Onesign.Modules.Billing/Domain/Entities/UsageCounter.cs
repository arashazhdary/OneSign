using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Entities;

public class UsageCounter
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public UsageMetricType MetricType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public long Value { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public void Increment(long amount = 1)
    {
        Value += amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
