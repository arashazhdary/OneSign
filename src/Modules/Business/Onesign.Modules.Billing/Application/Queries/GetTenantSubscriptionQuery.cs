using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetTenantSubscriptionQuery : IRequest<Result<TenantSubscriptionDto>>
{
    public Guid TenantId { get; set; }
}
