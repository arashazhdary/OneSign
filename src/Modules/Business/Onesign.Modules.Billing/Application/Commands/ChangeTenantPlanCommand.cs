using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class ChangeTenantPlanCommand : IRequest<Result<TenantSubscriptionDto>>
{
    public Guid TenantId { get; set; }
    public Guid NewPlanId { get; set; }
}
