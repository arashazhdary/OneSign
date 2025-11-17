using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class DeleteOrgUnitCommandHandler : IRequestHandler<DeleteOrgUnitCommand, Result>
{
    private readonly IOrgTreeService _orgTreeService;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IUserOrgUnitRepository _userOrgUnitRepository;
    private readonly IApplicationOrgUnitRepository _applicationOrgUnitRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<DeleteOrgUnitCommandHandler> _logger;

    public DeleteOrgUnitCommandHandler(
        IOrgTreeService orgTreeService,
        IOrgUnitRepository orgUnitRepository,
        IUserOrgUnitRepository userOrgUnitRepository,
        IApplicationOrgUnitRepository applicationOrgUnitRepository,
        IMediator mediator,
        ILogger<DeleteOrgUnitCommandHandler> logger)
    {
        _orgTreeService = orgTreeService;
        _orgUnitRepository = orgUnitRepository;
        _userOrgUnitRepository = userOrgUnitRepository;
        _applicationOrgUnitRepository = applicationOrgUnitRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteOrgUnitCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting OrgUnit: Id={Id}", request.OrgUnitId);

        var orgUnit = await _orgUnitRepository.GetByIdAsync(request.OrgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            return Result.Failure("ORG_UNIT_NOT_FOUND", "OrgUnit not found");
        }

        if (orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure("TENANT_MISMATCH", "OrgUnit does not belong to this tenant");
        }

        // Check if OrgUnit has users assigned
        var userOrgUnits = await _userOrgUnitRepository.GetByOrgUnitIdAsync(request.OrgUnitId, cancellationToken);
        if (userOrgUnits.Any())
        {
            return Result.Failure("ORG_UNIT_HAS_USERS", "Cannot delete OrgUnit with assigned users");
        }

        // Check if OrgUnit has applications assigned
        var applicationOrgUnits = await _applicationOrgUnitRepository.GetByOrgUnitIdAsync(request.OrgUnitId, cancellationToken);
        if (applicationOrgUnits.Any())
        {
            return Result.Failure("ORG_UNIT_HAS_APPLICATIONS", "Cannot delete OrgUnit with assigned applications");
        }

        try
        {
            await _orgTreeService.DeleteOrgUnitAsync(request.OrgUnitId, cancellationToken);

            await _mediator.Send(new AppendAuditEventCommand
            {
                TenantId = request.TenantId,
                ActorId = request.ActorId,
                EventType = AuditEventType.OrgUnitDeleted,
                Description = $"OrgUnit '{orgUnit.Name}' deleted",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { OrgUnitId = request.OrgUnitId })
            }, cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting OrgUnit");
            return Result.Failure("ORG_UNIT_DELETE_FAILED", ex.Message);
        }
    }
}

