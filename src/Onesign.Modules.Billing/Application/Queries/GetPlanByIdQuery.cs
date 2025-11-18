using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetPlanByIdQuery : IRequest<Result<PlanDto>>
{
    public Guid Id { get; set; }
}
