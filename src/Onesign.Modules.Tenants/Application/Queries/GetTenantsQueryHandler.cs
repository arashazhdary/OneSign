using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantsQueryHandler : IRequestHandler<GetTenantsQuery, PagedResult<TenantSummaryDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<PagedResult<TenantSummaryDto>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
    {
        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var totalCount = allTenants.Count;

        var pagedTenants = allTenants
            .OrderBy(x => x.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PagedResult<TenantSummaryDto>
        {
            Items = pagedTenants.Select(x => new TenantSummaryDto
            {
                Id = x.Id,
                Name = x.Name,
                Slug = x.Slug,
                Status = x.Status
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

