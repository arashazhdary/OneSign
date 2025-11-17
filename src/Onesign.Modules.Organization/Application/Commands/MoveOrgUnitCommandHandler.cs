using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class MoveOrgUnitCommandHandler : IRequestHandler<MoveOrgUnitCommand, Result>
{
    private readonly IOrgTreeService _orgTreeService;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly IMediator _mediator;
    private readonly ILogger<MoveOrgUnitCommandHandler> _logger;

    public MoveOrgUnitCommandHandler(
        IOrgTreeService orgTreeService,
        IOrgUnitRepository orgUnitRepository,
        IOrgAuthorizationService orgAuthorizationService,
        IMediator mediator,
        ILogger<MoveOrgUnitCommandHandler> logger)
    {
        _orgTreeService = orgTreeService;
        _orgUnitRepository = orgUnitRepository;
        _orgAuthorizationService = orgAuthorizationService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(MoveOrgUnitCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Moving OrgUnit: Id={Id}, NewParentId={NewParentId}", request.OrgUnitId, request.NewParentId);

        // Authorization check - must be able to manage both the OrgUnit being moved and the new parent
        var canManageOrgUnit = await _orgAuthorizationService.CanManageOrgUnitAsync(request.ActorId, request.OrgUnitId, cancellationToken);
        if (!canManageOrgUnit)
        {
            _logger.LogWarning("User {ActorId} is not authorized to manage OrgUnit {OrgUnitId}", request.ActorId, request.OrgUnitId);
            return Result.Failure("UNAUTHORIZED", "You are not authorized to move this organizational unit");
        }

        var canManageNewParent = await _orgAuthorizationService.CanManageOrgUnitAsync(request.ActorId, request.NewParentId, cancellationToken);
        if (!canManageNewParent)
        {
            _logger.LogWarning("User {ActorId} is not authorized to manage new parent OrgUnit {NewParentId}", request.ActorId, request.NewParentId);
            return Result.Failure("UNAUTHORIZED", "You are not authorized to move organizational units to this parent");
        }

        var orgUnit = await _orgUnitRepository.GetByIdAsync(request.OrgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            return Result.Failure("ORG_UNIT_NOT_FOUND", "OrgUnit not found");
        }

        if (orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure("TENANT_MISMATCH", "OrgUnit does not belong to this tenant");
        }

        try
        {
            await _orgTreeService.MoveOrgUnitAsync(request.OrgUnitId, request.NewParentId, cancellationToken);

            await _mediator.Send(new AppendAuditEventCommand
            {
                TenantId = request.TenantId,
                ActorId = request.ActorId,
                EventType = AuditEventType.OrgUnitMoved,
                Description = $"OrgUnit '{orgUnit.Name}' moved",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { OrgUnitId = request.OrgUnitId, NewParentId = request.NewParentId })
            }, cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error moving OrgUnit");
            return Result.Failure("ORG_UNIT_MOVE_FAILED", ex.Message);
        }
    }
}

