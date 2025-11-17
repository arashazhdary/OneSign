using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class UsageCounterEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public UsageMetricType MetricType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public long Value { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public UsageCounter ToDomain()
    {
        return new UsageCounter
        {
            Id = Id,
            TenantId = TenantId,
            MetricType = MetricType,
            PeriodYear = PeriodYear,
            PeriodMonth = PeriodMonth,
            Value = Value,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt
        };
    }

    public static UsageCounterEntity FromDomain(UsageCounter counter)
    {
        return new UsageCounterEntity
        {
            Id = counter.Id,
            TenantId = counter.TenantId,
            MetricType = counter.MetricType,
            PeriodYear = counter.PeriodYear,
            PeriodMonth = counter.PeriodMonth,
            Value = counter.Value,
            CreatedAt = counter.CreatedAt,
            UpdatedAt = counter.UpdatedAt
        };
    }
}
