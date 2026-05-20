using MediatR;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateTenantStatusCommandHandler : IRequestHandler<UpdateTenantStatusCommand, Result<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMediator _mediator;

    public UpdateTenantStatusCommandHandler(ITenantRepository tenantRepository, IMediator mediator)
    {
        _tenantRepository = tenantRepository;
        _mediator = mediator;
    }

    public async Task<Result<TenantDto>> Handle(UpdateTenantStatusCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return Result.Failure<TenantDto>("TENANT_NOT_FOUND", "Tenant not found");
        }

        var oldStatus = tenant.Status;
        tenant.Status = request.Status;
        await _tenantRepository.UpdateAsync(tenant, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = tenant.Id,
            ActorId = null, // Admin user ID should be passed from request
            EventType = AuditEventType.TenantStatusChanged,
            Description = $"Tenant '{tenant.Name}' status changed from {oldStatus} to {request.Status}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantId = tenant.Id, OldStatus = oldStatus.ToString(), NewStatus = request.Status.ToString() })
        }, cancellationToken);

        return Result.Success(new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Slug = tenant.Slug,
            Status = tenant.Status,
            IsSandbox = tenant.IsSandbox,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }
}

