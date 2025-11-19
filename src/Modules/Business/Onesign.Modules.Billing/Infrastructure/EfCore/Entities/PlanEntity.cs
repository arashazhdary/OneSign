using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class PlanEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PlanType Type { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PlanFeatureEntity> Features { get; set; } = new List<PlanFeatureEntity>();

    public Plan ToDomain()
    {
        return new Plan
        {
            Id = Id,
            Name = Name,
            Code = Code,
            Type = Type,
            IsActive = IsActive,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt,
            Features = Features.Select(f => f.ToDomain()).ToList()
        };
    }

    public static PlanEntity FromDomain(Plan plan)
    {
        return new PlanEntity
        {
            Id = plan.Id,
            Name = plan.Name,
            Code = plan.Code,
            Type = plan.Type,
            IsActive = plan.IsActive,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            Features = plan.Features.Select(f => PlanFeatureEntity.FromDomain(f)).ToList()
        };
    }
}
