using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Application.DTOs;

public class PlanFeatureDto
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public LimitType? LimitType { get; set; }
}
