using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetOrgUnitDetailsQueryHandler : IRequestHandler<GetOrgUnitDetailsQuery, Result<OrgUnitDto>>
{
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly ILogger<GetOrgUnitDetailsQueryHandler> _logger;

    public GetOrgUnitDetailsQueryHandler(
        IOrgUnitRepository orgUnitRepository,
        ILogger<GetOrgUnitDetailsQueryHandler> logger)
    {
        _orgUnitRepository = orgUnitRepository;
        _logger = logger;
    }

    public async Task<Result<OrgUnitDto>> Handle(GetOrgUnitDetailsQuery request, CancellationToken cancellationToken)
    {
        var orgUnit = await _orgUnitRepository.GetByIdAsync(request.OrgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            return Result.Failure<OrgUnitDto>("ORG_UNIT_NOT_FOUND", "OrgUnit not found");
        }

        if (orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure<OrgUnitDto>("TENANT_MISMATCH", "OrgUnit does not belong to this tenant");
        }

        var dto = new OrgUnitDto
        {
            Id = orgUnit.Id,
            TenantId = orgUnit.TenantId,
            ParentId = orgUnit.ParentId,
            Name = orgUnit.Name,
            Code = orgUnit.Code,
            Path = orgUnit.Path,
            Level = orgUnit.Level,
            SortOrder = orgUnit.SortOrder,
            Status = orgUnit.Status,
            CreatedAt = orgUnit.CreatedAt,
            UpdatedAt = orgUnit.UpdatedAt
        };

        return Result.Success(dto);
    }
}

