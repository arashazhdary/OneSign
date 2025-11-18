using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Application.DTOs;

public class PlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PlanType Type { get; set; }
    public bool IsActive { get; set; }
    public List<PlanFeatureDto> Features { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
