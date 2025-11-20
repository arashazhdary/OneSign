using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class AssignUserOrgUnitsCommandHandler : IRequestHandler<AssignUserOrgUnitsCommand, Result>
{
    private readonly IUserOrgUnitRepository _userOrgUnitRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly IMediator _mediator;
    private readonly ILogger<AssignUserOrgUnitsCommandHandler> _logger;

    public AssignUserOrgUnitsCommandHandler(
        IUserOrgUnitRepository userOrgUnitRepository,
        IOrgUnitRepository orgUnitRepository,
        IOrgAuthorizationService orgAuthorizationService,
        IMediator mediator,
        ILogger<AssignUserOrgUnitsCommandHandler> logger)
    {
        _userOrgUnitRepository = userOrgUnitRepository;
        _orgUnitRepository = orgUnitRepository;
        _orgAuthorizationService = orgAuthorizationService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(AssignUserOrgUnitsCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Assigning OrgUnits to user: TenantUserId={TenantUserId}, Primary={PrimaryOrgUnitId}",
            request.TenantUserId, request.PrimaryOrgUnitId);

        // Authorization check
        var canManageUser = await _orgAuthorizationService.CanManageUserAsync(request.ActorId, request.TenantUserId, cancellationToken);
        if (!canManageUser)
        {
            _logger.LogWarning("User {ActorId} is not authorized to manage user {TenantUserId}", request.ActorId, request.TenantUserId);
            return Result.Failure("UNAUTHORIZED", "You are not authorized to assign organizational units to this user");
        }

        // Validate primary OrgUnit
        var primaryOrgUnit = await _orgUnitRepository.GetByIdAsync(request.PrimaryOrgUnitId, cancellationToken);
        if (primaryOrgUnit == null || primaryOrgUnit.TenantId != request.TenantId)
        {
            return Result.Failure("ORG_UNIT_NOT_FOUND", "Primary OrgUnit not found or does not belong to tenant");
        }

        // Validate secondary OrgUnits
        foreach (var secondaryOrgUnitId in request.SecondaryOrgUnitIds)
        {
            var secondaryOrgUnit = await _orgUnitRepository.GetByIdAsync(secondaryOrgUnitId, cancellationToken);
            if (secondaryOrgUnit == null || secondaryOrgUnit.TenantId != request.TenantId)
            {
                return Result.Failure("ORG_UNIT_NOT_FOUND", $"Secondary OrgUnit {secondaryOrgUnitId} not found or does not belong to tenant");
            }
        }

        // Remove existing assignments
        await _userOrgUnitRepository.DeleteByTenantUserIdAsync(request.TenantUserId, cancellationToken);

        // Add primary OrgUnit
        var userOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit
            {
                TenantUserId = request.TenantUserId,
                OrgUnitId = request.PrimaryOrgUnitId,
                IsPrimary = true
            }
        };

        // Add secondary OrgUnits
        foreach (var secondaryOrgUnitId in request.SecondaryOrgUnitIds)
        {
            userOrgUnits.Add(new UserOrgUnit
            {
                TenantUserId = request.TenantUserId,
                OrgUnitId = secondaryOrgUnitId,
                IsPrimary = false
            });
        }

        await _userOrgUnitRepository.AddRangeAsync(userOrgUnits, cancellationToken);

        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = AuditEventType.UserOrgUnitAssigned,
            Description = $"OrgUnits assigned to user {request.TenantUserId}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantUserId = request.TenantUserId, PrimaryOrgUnitId = request.PrimaryOrgUnitId, SecondaryOrgUnitIds = request.SecondaryOrgUnitIds })
        }, cancellationToken);

        _logger.LogInformation("OrgUnits assigned successfully to user: TenantUserId={TenantUserId}", request.TenantUserId);

        return Result.Success();
    }
}

