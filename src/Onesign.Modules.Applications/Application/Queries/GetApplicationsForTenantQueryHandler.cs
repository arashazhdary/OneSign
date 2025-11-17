using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Shared.Pagination;

namespace Onesign.Modules.Applications.Application.Queries;

public class GetApplicationsForTenantQueryHandler : IRequestHandler<GetApplicationsForTenantQuery, PagedResult<ApplicationClientDto>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly DbContext _dbContext;

    public GetApplicationsForTenantQueryHandler(
        IApplicationClientRepository applicationClientRepository,
        DbContext dbContext)
    {
        _applicationClientRepository = applicationClientRepository;
        _dbContext = dbContext;
    }

    public async Task<PagedResult<ApplicationClientDto>> Handle(GetApplicationsForTenantQuery request, CancellationToken cancellationToken)
    {
        var applications = await _applicationClientRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        
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
                            $"SELECT DISTINCT ApplicationClientId FROM ApplicationOrgUnits WHERE OrgUnitId IN ({inClause})",
                            descendantIds.Cast<object>().ToArray());
                        var applicationOrgUnitIds = await _dbContext.Database
                            .SqlQuery<Guid>(sql)
                            .ToListAsync(cancellationToken);

                        applications = applications.Where(a => applicationOrgUnitIds.Contains(a.Id)).ToList();
                    }
                }
            }
            catch
            {
                // If OrgUnits table doesn't exist yet (during migration), skip filtering
            }
        }
        
        var totalCount = applications.Count;

        var pagedApplications = applications
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var applicationIds = pagedApplications.Select(x => x.Id).ToList();
        var redirectUris = await _dbContext.Set<ClientRedirectUriEntity>()
            .Where(x => applicationIds.Contains(x.ApplicationClientId))
            .ToListAsync(cancellationToken);

        var redirectUrisByApp = redirectUris.GroupBy(x => x.ApplicationClientId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return new PagedResult<ApplicationClientDto>
        {
            Items = pagedApplications.Select(x => new ApplicationClientDto
            {
                Id = x.Id,
                TenantId = x.TenantId,
                ClientId = x.ClientId,
                Name = x.Name,
                ApplicationType = x.ApplicationType,
                GrantType = x.GrantType,
                RedirectUris = redirectUrisByApp.TryGetValue(x.Id, out var uris)
                    ? uris.Select(u => new RedirectUriDto { Id = u.Id, Uri = u.Uri }).ToList()
                    : new List<RedirectUriDto>(),
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

