using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class CreateDelegatedAdminCommandHandler : IRequestHandler<CreateDelegatedAdminCommand, Result<DelegatedAdminDto>>
{
    private readonly IDelegatedAdminRepository _delegatedAdminRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateDelegatedAdminCommandHandler> _logger;

    public CreateDelegatedAdminCommandHandler(
        IDelegatedAdminRepository delegatedAdminRepository,
        IOrgUnitRepository orgUnitRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IMediator mediator,
        ILogger<CreateDelegatedAdminCommandHandler> logger)
    {
        _delegatedAdminRepository = delegatedAdminRepository;
        _orgUnitRepository = orgUnitRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<DelegatedAdminDto>> Handle(CreateDelegatedAdminCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating delegated admin: TenantUserId={TenantUserId}, OrgUnitId={OrgUnitId}", 
            request.TenantUserId, request.OrgUnitId);

        var tenantUser = await _tenantUserRepository.GetByIdAsync(request.TenantUserId, cancellationToken);
        if (tenantUser == null || tenantUser.TenantId != request.TenantId)
        {
            return Result.Failure<DelegatedAdminDto>("USER_NOT_FOUND", "User not found or does not belong to tenant");
        }

        if (!tenantUser.IsAdmin)
        {
            return Result.Failure<DelegatedAdminDto>("USER_NOT_ADMIN", "User is not an admin");
        }

        var orgUnit = await _orgUnitRepository.GetByIdAsync(request.OrgUnitId, cancellationToken);
        if (orgUnit == null || orgUnit.TenantId != request.TenantId)
        {
            return Result.Failure<DelegatedAdminDto>("ORG_UNIT_NOT_FOUND", "OrgUnit not found or does not belong to tenant");
        }

        // Check if already exists
        var exists = await _delegatedAdminRepository.ExistsAsync(request.TenantUserId, request.OrgUnitId, cancellationToken);
        if (exists)
        {
            return Result.Failure<DelegatedAdminDto>("DELEGATED_ADMIN_EXISTS", "Delegated admin already exists for this user and OrgUnit");
        }

        var delegatedAdminScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = request.TenantUserId,
            OrgUnitId = request.OrgUnitId,
            ScopeType = request.ScopeType,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _delegatedAdminRepository.AddAsync(delegatedAdminScope, cancellationToken);

        // Get user info for DTO
        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);

        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = AuditEventType.DelegatedAdminCreated,
            Description = $"Delegated admin created for user {request.TenantUserId} on OrgUnit {request.OrgUnitId}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { DelegatedAdminId = created.Id, TenantUserId = request.TenantUserId, OrgUnitId = request.OrgUnitId, ScopeType = request.ScopeType })
        }, cancellationToken);

        var dto = new DelegatedAdminDto
        {
            Id = created.Id,
            TenantUserId = created.TenantUserId,
            UserEmail = globalUser?.Email,
            UserDisplayName = globalUser?.Email, // Using email as display name for now
            OrgUnitId = created.OrgUnitId,
            OrgUnitName = orgUnit.Name,
            ScopeType = created.ScopeType,
            CreatedAt = created.CreatedAt
        };

        return Result.Success(dto);
    }
}

