using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class AssignApplicationOrgUnitsCommandHandler : IRequestHandler<AssignApplicationOrgUnitsCommand, Result>
{
    private readonly IApplicationOrgUnitRepository _applicationOrgUnitRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<AssignApplicationOrgUnitsCommandHandler> _logger;

    public AssignApplicationOrgUnitsCommandHandler(
        IApplicationOrgUnitRepository applicationOrgUnitRepository,
        IOrgUnitRepository orgUnitRepository,
        IMediator mediator,
        ILogger<AssignApplicationOrgUnitsCommandHandler> logger)
    {
        _applicationOrgUnitRepository = applicationOrgUnitRepository;
        _orgUnitRepository = orgUnitRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(AssignApplicationOrgUnitsCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Assigning OrgUnits to application: ApplicationClientId={ApplicationClientId}", request.ApplicationClientId);

        // Validate OrgUnits
        foreach (var orgUnitId in request.OrgUnitIds)
        {
            var orgUnit = await _orgUnitRepository.GetByIdAsync(orgUnitId, cancellationToken);
            if (orgUnit == null || orgUnit.TenantId != request.TenantId)
            {
                return Result.Failure("ORG_UNIT_NOT_FOUND", $"OrgUnit {orgUnitId} not found or does not belong to tenant");
            }
        }

        // Remove existing assignments
        await _applicationOrgUnitRepository.DeleteByApplicationClientIdAsync(request.ApplicationClientId, cancellationToken);

        // Add new assignments
        var applicationOrgUnits = request.OrgUnitIds.Select(orgUnitId => new ApplicationOrgUnit
        {
            ApplicationClientId = request.ApplicationClientId,
            OrgUnitId = orgUnitId
        }).ToList();

        await _applicationOrgUnitRepository.AddRangeAsync(applicationOrgUnits, cancellationToken);

        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = AuditEventType.ApplicationOrgUnitAssigned,
            Description = $"OrgUnits assigned to application {request.ApplicationClientId}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { ApplicationClientId = request.ApplicationClientId, OrgUnitIds = request.OrgUnitIds })
        }, cancellationToken);

        _logger.LogInformation("OrgUnits assigned successfully to application: ApplicationClientId={ApplicationClientId}", request.ApplicationClientId);

        return Result.Success();
    }
}

