using MediatR;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class DisableTenantUserCommandHandler : IRequestHandler<DisableTenantUserCommand, Result<TenantUserDto>>
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IMediator _mediator;

    public DisableTenantUserCommandHandler(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IMediator mediator)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _mediator = mediator;
    }

    public async Task<Result<TenantUserDto>> Handle(DisableTenantUserCommand request, CancellationToken cancellationToken)
    {
        var tenantUser = await _tenantUserRepository.GetByIdAsync(request.TenantUserId, cancellationToken);
        if (tenantUser == null || tenantUser.TenantId != request.TenantId)
        {
            return Result.Failure<TenantUserDto>("USER_NOT_FOUND", "User not found");
        }

        tenantUser.Status = TenantUserStatus.Disabled;
        await _tenantUserRepository.UpdateAsync(tenantUser, cancellationToken);

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = tenantUser.TenantId,
            ActorId = null, // Admin user ID should be passed from request
            EventType = AuditEventType.UserDisabled,
            Description = $"User '{globalUser?.Email ?? "Unknown"}' was disabled",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantUserId = tenantUser.Id, Email = globalUser?.Email })
        }, cancellationToken);

        return Result.Success(new TenantUserDto
        {
            Id = tenantUser.Id,
            GlobalUserId = tenantUser.GlobalUserId,
            Email = globalUser?.Email ?? string.Empty,
            TenantId = tenantUser.TenantId,
            Status = tenantUser.Status,
            IsAdmin = tenantUser.IsAdmin,
            FirstLoginAt = tenantUser.FirstLoginAt,
            LastLoginAt = tenantUser.LastLoginAt,
            CreatedAt = tenantUser.CreatedAt
        });
    }
}

