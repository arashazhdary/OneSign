using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Entities;

public class Plan
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PlanType Type { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PlanFeature> Features { get; set; } = new List<PlanFeature>();
}
