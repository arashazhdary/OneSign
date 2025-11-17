using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class PlanFeatureEntity
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public LimitType? LimitType { get; set; }

    public PlanEntity? Plan { get; set; }

    public PlanFeature ToDomain()
    {
        return new PlanFeature
        {
            Id = Id,
            PlanId = PlanId,
            Key = Key,
            Value = Value,
            LimitType = LimitType
        };
    }

    public static PlanFeatureEntity FromDomain(PlanFeature feature)
    {
        return new PlanFeatureEntity
        {
            Id = feature.Id,
            PlanId = feature.PlanId,
            Key = feature.Key,
            Value = feature.Value,
            LimitType = feature.LimitType
        };
    }
}
