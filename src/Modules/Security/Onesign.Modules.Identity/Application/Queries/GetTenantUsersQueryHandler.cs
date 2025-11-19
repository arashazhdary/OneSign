using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetTenantUsersQueryHandler : IRequestHandler<GetTenantUsersQuery, PagedResult<TenantUserDto>>
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly DbContext _dbContext;

    public GetTenantUsersQueryHandler(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        DbContext dbContext)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _dbContext = dbContext;
    }

    public async Task<PagedResult<TenantUserDto>> Handle(GetTenantUsersQuery request, CancellationToken cancellationToken)
    {
        var tenantUsers = await _tenantUserRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        
        // Filter by OrgUnit if provided
        if (request.OrgUnitId.HasValue)
        {
            // Use parameterized SQL to avoid circular dependency and SQL injection
            try
            {
                var orgUnitPathSql = FormattableStringFactory.Create(
                    "SELECT Path FROM OrgUnits WHERE Id = {0}",
                    request.OrgUnitId.Value);
                var orgUnitPathResult = await _dbContext.Database
                    .SqlQuery<string>(orgUnitPathSql)
                    .FirstOrDefaultAsync(cancellationToken);
                
                if (!string.IsNullOrEmpty(orgUnitPathResult))
                {
                    var pathPrefix = orgUnitPathResult + "/";
                    
                    // Get descendant OrgUnit IDs
                    var descendantSql = FormattableStringFactory.Create(
                        "SELECT Id FROM OrgUnits WHERE Path LIKE {0} OR Id = {1}",
                        pathPrefix + "%",
                        request.OrgUnitId.Value);
                    var descendantIds = await _dbContext.Database
                        .SqlQuery<Guid>(descendantSql)
                        .ToListAsync(cancellationToken);

                    if (descendantIds.Any())
                    {
                        // Build IN clause with parameters
                        var inClause = string.Join(",", descendantIds.Select((id, i) => $"{{{i}}}"));
                        var sql = FormattableStringFactory.Create(
                            $"SELECT DISTINCT TenantUserId FROM UserOrgUnits WHERE OrgUnitId IN ({inClause})",
                            descendantIds.Cast<object>().ToArray());
                        var userOrgUnitIds = await _dbContext.Database
                            .SqlQuery<Guid>(sql)
                            .ToListAsync(cancellationToken);

                        tenantUsers = tenantUsers.Where(u => userOrgUnitIds.Contains(u.Id)).ToList();
                    }
                }
            }
            catch
            {
                // If OrgUnits table doesn't exist yet (during migration), skip filtering
            }
        }
        
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

