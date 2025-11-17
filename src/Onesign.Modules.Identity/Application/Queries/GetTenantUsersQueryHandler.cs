using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetTenantUsersQueryHandler : IRequestHandler<GetTenantUsersQuery, PagedResult<TenantUserDto>>
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;

    public GetTenantUsersQueryHandler(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
    }

    public async Task<PagedResult<TenantUserDto>> Handle(GetTenantUsersQuery request, CancellationToken cancellationToken)
    {
        var tenantUsers = await _tenantUserRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var totalCount = tenantUsers.Count;

        var pagedUsers = tenantUsers
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var globalUserIds = pagedUsers.Select(x => x.GlobalUserId).ToList();
        var globalUsers = new Dictionary<Guid, Domain.Entities.GlobalUser>();
        foreach (var userId in globalUserIds)
        {
            var user = await _globalUserRepository.GetByIdAsync(userId, cancellationToken);
            if (user != null)
            {
                globalUsers[userId] = user;
            }
        }

        return new PagedResult<TenantUserDto>
        {
            Items = pagedUsers.Select(x => new TenantUserDto
            {
                Id = x.Id,
                GlobalUserId = x.GlobalUserId,
                Email = globalUsers.TryGetValue(x.GlobalUserId, out var globalUser) ? globalUser.Email : string.Empty,
                TenantId = x.TenantId,
                Status = x.Status,
                IsAdmin = x.IsAdmin,
                FirstLoginAt = x.FirstLoginAt,
                LastLoginAt = x.LastLoginAt,
                CreatedAt = x.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

