using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetTenantQuotaStatusQuery : IRequest<Result<TenantQuotaStatusDto>>
{
    public Guid TenantId { get; set; }
}
