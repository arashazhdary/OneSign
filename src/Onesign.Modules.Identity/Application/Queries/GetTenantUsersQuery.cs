using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetTenantUsersQuery : IRequest<PagedResult<TenantUserDto>>
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

