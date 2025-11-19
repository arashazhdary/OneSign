using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetPlansQuery : IRequest<Result<List<PlanDto>>>
{
    public bool? IsActive { get; set; }
}
