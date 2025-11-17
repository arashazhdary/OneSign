using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class RemoveDelegatedAdminCommandHandler : IRequestHandler<RemoveDelegatedAdminCommand, Result>
{
    private readonly IDelegatedAdminRepository _delegatedAdminRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly IMediator _mediator;
    private readonly ILogger<RemoveDelegatedAdminCommandHandler> _logger;

    public RemoveDelegatedAdminCommandHandler(
        IDelegatedAdminRepository delegatedAdminRepository,
        IOrgUnitRepository orgUnitRepository,
        IOrgAuthorizationService orgAuthorizationService,
        IMediator mediator,
        ILogger<RemoveDelegatedAdminCommandHandler> logger)
    {
        _delegatedAdminRepository = delegatedAdminRepository;
        _orgUnitRepository = orgUnitRepository;
        _orgAuthorizationService = orgAuthorizationService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(RemoveDelegatedAdminCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Removing delegated admin: Id={Id}", request.DelegatedAdminId);

        // Authorization check - only global admins can remove delegated admins
        var effectiveScope = await _orgAuthorizationService.GetEffectiveScopeAsync(request.ActorId, cancellationToken);
        if (!effectiveScope.IsGlobalAdmin)
        {
            _logger.LogWarning("User {ActorId} is not authorized to remove delegated admins (not a global admin)", request.ActorId);
            return Result.Failure("UNAUTHORIZED", "Only global administrators can remove delegated admins");
        }

        var delegatedAdmin = await _delegatedAdminRepository.GetByIdAsync(request.DelegatedAdminId, cancellationToken);
        if (delegatedAdmin == null)
        {
            return Result.Failure("DELEGATED_ADMIN_NOT_FOUND", "Delegated admin not found");
        }

        var orgUnit = await _orgUnitRepository.GetByIdAsync(delegatedAdmin.OrgUnitId, cancellationToken);
        if (orgUnit == null || orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure("TENANT_MISMATCH", "Delegated admin does not belong to this tenant");
        }

        await _delegatedAdminRepository.DeleteAsync(request.DelegatedAdminId, cancellationToken);

        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = AuditEventType.DelegatedAdminRemoved,
            Description = $"Delegated admin {request.DelegatedAdminId} removed",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { DelegatedAdminId = request.DelegatedAdminId, TenantUserId = delegatedAdmin.TenantUserId, OrgUnitId = delegatedAdmin.OrgUnitId })
        }, cancellationToken);

        _logger.LogInformation("Delegated admin removed successfully: Id={Id}", request.DelegatedAdminId);

        return Result.Success();
    }
}

