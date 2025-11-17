using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class UpdateOrgUnitCommandHandler : IRequestHandler<UpdateOrgUnitCommand, Result<OrgUnitDto>>
{
    private readonly IOrgTreeService _orgTreeService;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateOrgUnitCommandHandler> _logger;

    public UpdateOrgUnitCommandHandler(
        IOrgTreeService orgTreeService,
        IOrgUnitRepository orgUnitRepository,
        IOrgAuthorizationService orgAuthorizationService,
        IMediator mediator,
        ILogger<UpdateOrgUnitCommandHandler> logger)
    {
        _orgTreeService = orgTreeService;
        _orgUnitRepository = orgUnitRepository;
        _orgAuthorizationService = orgAuthorizationService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<OrgUnitDto>> Handle(UpdateOrgUnitCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating OrgUnit: Id={Id}, Name={Name}", request.OrgUnitId, request.Name);

        // Authorization check
        var canManage = await _orgAuthorizationService.CanManageOrgUnitAsync(request.ActorId, request.OrgUnitId, cancellationToken);
        if (!canManage)
        {
            _logger.LogWarning("User {ActorId} is not authorized to manage OrgUnit {OrgUnitId}", request.ActorId, request.OrgUnitId);
            return Result.Failure<OrgUnitDto>("UNAUTHORIZED", "You are not authorized to update this organizational unit");
        }

        var orgUnit = await _orgUnitRepository.GetByIdAsync(request.OrgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            return Result.Failure<OrgUnitDto>("ORG_UNIT_NOT_FOUND", "OrgUnit not found");
        }

        if (orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure<OrgUnitDto>("TENANT_MISMATCH", "OrgUnit does not belong to this tenant");
        }

        try
        {
            var updated = await _orgTreeService.UpdateOrgUnitAsync(
                request.OrgUnitId,
                request.Name,
                orgUnit.Code, // Keep existing code
                request.SortOrder ?? orgUnit.SortOrder,
                orgUnit.Status, // Keep existing status
                cancellationToken);

            await _mediator.Send(new AppendAuditEventCommand
            {
                TenantId = request.TenantId,
                ActorId = request.ActorId,
                EventType = AuditEventType.OrgUnitUpdated,
                Description = $"OrgUnit '{request.Name}' updated",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { OrgUnitId = request.OrgUnitId })
            }, cancellationToken);

            var dto = new OrgUnitDto
            {
                Id = updated.Id,
                TenantId = updated.TenantId,
                ParentId = updated.ParentId,
                Name = updated.Name,
                Code = updated.Code,
                Path = updated.Path,
                Level = updated.Level,
                SortOrder = updated.SortOrder,
                Status = updated.Status,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating OrgUnit");
            return Result.Failure<OrgUnitDto>("ORG_UNIT_UPDATE_FAILED", ex.Message);
        }
    }
}

