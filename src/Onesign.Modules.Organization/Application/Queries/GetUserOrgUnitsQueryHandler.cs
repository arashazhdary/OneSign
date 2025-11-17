using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetUserOrgUnitsQueryHandler : IRequestHandler<GetUserOrgUnitsQuery, Result<AssignUserOrgUnitsRequest>>
{
    private readonly IUserOrgUnitRepository _userOrgUnitRepository;
    private readonly ILogger<GetUserOrgUnitsQueryHandler> _logger;

    public GetUserOrgUnitsQueryHandler(
        IUserOrgUnitRepository userOrgUnitRepository,
        ILogger<GetUserOrgUnitsQueryHandler> logger)
    {
        _userOrgUnitRepository = userOrgUnitRepository;
        _logger = logger;
    }

    public async Task<Result<AssignUserOrgUnitsRequest>> Handle(GetUserOrgUnitsQuery request, CancellationToken cancellationToken)
    {
        var userOrgUnits = await _userOrgUnitRepository.GetByTenantUserIdAsync(request.TenantUserId, cancellationToken);

        var primary = userOrgUnits.FirstOrDefault(u => u.IsPrimary);
        var secondary = userOrgUnits.Where(u => !u.IsPrimary).Select(u => u.OrgUnitId).ToList();

        var result = new AssignUserOrgUnitsRequest
        {
            PrimaryOrgUnitId = primary?.OrgUnitId ?? Guid.Empty,
            SecondaryOrgUnitIds = secondary
        };

        return Result.Success(result);
    }
}

