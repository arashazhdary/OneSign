using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class CreateOrgUnitCommandHandler : IRequestHandler<CreateOrgUnitCommand, Result<OrgUnitDto>>
{
    private readonly IOrgTreeService _orgTreeService;
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateOrgUnitCommandHandler> _logger;

    public CreateOrgUnitCommandHandler(
        IOrgTreeService orgTreeService,
        IOrgAuthorizationService orgAuthorizationService,
        IMediator mediator,
        ILogger<CreateOrgUnitCommandHandler> logger)
    {
        _orgTreeService = orgTreeService;
        _orgAuthorizationService = orgAuthorizationService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<OrgUnitDto>> Handle(CreateOrgUnitCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating OrgUnit: TenantId={TenantId}, ParentId={ParentId}, Name={Name}",
            request.TenantId, request.ParentId, request.Name);

        try
        {
            // Authorization: Check if user can manage parent OrgUnit (or tenant if no parent)
            if (request.ParentId.HasValue)
            {
                var canManage = await _orgAuthorizationService.CanManageOrgUnitAsync(request.ActorId, request.ParentId.Value, cancellationToken);
                if (!canManage)
                {
                    _logger.LogWarning("User {ActorId} unauthorized to create OrgUnit under {ParentId}", request.ActorId, request.ParentId);
                    return Result.Failure<OrgUnitDto>("UNAUTHORIZED", "You do not have permission to create OrgUnits in this scope");
                }
            }
            else
            {
                // Creating root OrgUnit - only global admins allowed
                var scope = await _orgAuthorizationService.GetEffectiveScopeAsync(request.ActorId, cancellationToken);
                if (!scope.IsGlobalAdmin)
                {
                    _logger.LogWarning("User {ActorId} unauthorized to create root OrgUnit", request.ActorId);
                    return Result.Failure<OrgUnitDto>("UNAUTHORIZED", "Only global administrators can create root OrgUnits");
                }
            }

            var orgUnit = await _orgTreeService.CreateChildAsync(
                request.TenantId,
                request.ParentId,
                request.Name,
                request.Code,
                request.SortOrder,
                cancellationToken);

            await _mediator.Send(new AppendAuditEventCommand
            {
                TenantId = request.TenantId,
                ActorId = request.ActorId,
                EventType = AuditEventType.OrgUnitCreated,
                Description = $"OrgUnit '{request.Name}' created",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { OrgUnitId = orgUnit.Id, ParentId = request.ParentId })
            }, cancellationToken);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating OrgUnit");
            return Result.Failure<OrgUnitDto>("ORG_UNIT_CREATE_FAILED", ex.Message);
        }
    }
}
