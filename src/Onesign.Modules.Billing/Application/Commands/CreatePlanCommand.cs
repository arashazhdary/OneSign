using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class CreatePlanCommand : IRequest<Result<PlanDto>>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public PlanType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public List<PlanFeatureDto> Features { get; set; } = new();
}
