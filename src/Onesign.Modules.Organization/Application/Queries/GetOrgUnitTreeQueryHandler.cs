using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetOrgUnitTreeQueryHandler : IRequestHandler<GetOrgUnitTreeQuery, Result<List<OrgUnitTreeNodeDto>>>
{
    private readonly IOrgTreeService _orgTreeService;
    private readonly ILogger<GetOrgUnitTreeQueryHandler> _logger;

    public GetOrgUnitTreeQueryHandler(
        IOrgTreeService orgTreeService,
        ILogger<GetOrgUnitTreeQueryHandler> logger)
    {
        _orgTreeService = orgTreeService;
        _logger = logger;
    }

    public async Task<Result<List<OrgUnitTreeNodeDto>>> Handle(GetOrgUnitTreeQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting OrgUnit tree for tenant: TenantId={TenantId}", request.TenantId);

        var orgUnits = await _orgTreeService.GetTreeForTenantAsync(request.TenantId, cancellationToken);

        // Build tree structure
        var nodeMap = orgUnits.ToDictionary(
            o => o.Id,
            o => new OrgUnitTreeNodeDto
            {
                Id = o.Id,
                ParentId = o.ParentId,
                Name = o.Name,
                Code = o.Code,
                Level = o.Level,
                Status = o.Status,
                Children = new List<OrgUnitTreeNodeDto>()
            });

        var rootNodes = new List<OrgUnitTreeNodeDto>();

        foreach (var orgUnit in orgUnits.OrderBy(o => o.SortOrder))
        {
            var node = nodeMap[orgUnit.Id];
            if (orgUnit.ParentId.HasValue && nodeMap.ContainsKey(orgUnit.ParentId.Value))
            {
                nodeMap[orgUnit.ParentId.Value].Children.Add(node);
            }
            else
            {
                rootNodes.Add(node);
            }
        }

        return Result.Success(rootNodes);
    }
}

