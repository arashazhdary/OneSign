using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, Result<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateTenantCommandHandler> _logger;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository, 
        ITenantConfigRepository tenantConfigRepository,
        IMediator mediator,
        ILogger<CreateTenantCommandHandler> logger)
    {
        _tenantRepository = tenantRepository;
        _tenantConfigRepository = tenantConfigRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<TenantDto>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating tenant with name: {Name}, slug: {Slug}", request.Name, request.Slug);
        
        var existingTenant = await _tenantRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existingTenant != null)
        {
            _logger.LogWarning("Tenant creation failed: slug {Slug} already exists", request.Slug);
            return Result.Failure<TenantDto>("TENANT_SLUG_EXISTS", "Tenant with this slug already exists");
        }

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug,
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        var createdTenant = await _tenantRepository.AddAsync(tenant, cancellationToken);

        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = createdTenant.Id,
            CreatedAt = DateTime.UtcNow
        };
        await _tenantConfigRepository.AddAsync(config, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = null, // Global event
            ActorId = null, // System or admin user ID should be passed from request
            EventType = AuditEventType.TenantCreated,
            Description = $"Tenant '{createdTenant.Name}' (Slug: {createdTenant.Slug}) was created",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantId = createdTenant.Id, TenantName = createdTenant.Name, TenantSlug = createdTenant.Slug })
        }, cancellationToken);

        _logger.LogInformation("Tenant created successfully: {TenantId}, Name: {Name}", createdTenant.Id, createdTenant.Name);

        return Result.Success(new TenantDto
        {
            Id = createdTenant.Id,
            Name = createdTenant.Name,
            Slug = createdTenant.Slug,
            Status = createdTenant.Status,
            CreatedAt = createdTenant.CreatedAt,
            UpdatedAt = createdTenant.UpdatedAt
        });
    }
}

