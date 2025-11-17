using MediatR;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Applications.Application.Queries;

public class GetApplicationsForTenantQuery : IRequest<PagedResult<ApplicationClientDto>>
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

