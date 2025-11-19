using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantsQuery : IRequest<PagedResult<TenantSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

