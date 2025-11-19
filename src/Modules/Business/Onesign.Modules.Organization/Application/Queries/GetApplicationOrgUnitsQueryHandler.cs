using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetApplicationOrgUnitsQueryHandler : IRequestHandler<GetApplicationOrgUnitsQuery, Result<AssignApplicationOrgUnitsRequest>>
{
    private readonly IApplicationOrgUnitRepository _applicationOrgUnitRepository;
    private readonly ILogger<GetApplicationOrgUnitsQueryHandler> _logger;

    public GetApplicationOrgUnitsQueryHandler(
        IApplicationOrgUnitRepository applicationOrgUnitRepository,
        ILogger<GetApplicationOrgUnitsQueryHandler> logger)
    {
        _applicationOrgUnitRepository = applicationOrgUnitRepository;
        _logger = logger;
    }

    public async Task<Result<AssignApplicationOrgUnitsRequest>> Handle(GetApplicationOrgUnitsQuery request, CancellationToken cancellationToken)
    {
        var applicationOrgUnits = await _applicationOrgUnitRepository.GetByApplicationClientIdAsync(request.ApplicationClientId, cancellationToken);

        var result = new AssignApplicationOrgUnitsRequest
        {
            OrgUnitIds = applicationOrgUnits.Select(a => a.OrgUnitId).ToList()
        };

        return Result.Success(result);
    }
}

