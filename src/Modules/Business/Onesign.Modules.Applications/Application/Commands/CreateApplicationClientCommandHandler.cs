using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class CreateApplicationClientCommandHandler : IRequestHandler<CreateApplicationClientCommand, Result<ApplicationClientDto>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly DbContext _dbContext;
    private readonly IMediator _mediator;

    public CreateApplicationClientCommandHandler(
        IApplicationClientRepository applicationClientRepository,
        DbContext dbContext,
        IMediator mediator)
    {
        _applicationClientRepository = applicationClientRepository;
        _dbContext = dbContext;
        _mediator = mediator;
    }

    public async Task<Result<ApplicationClientDto>> Handle(CreateApplicationClientCommand request, CancellationToken cancellationToken)
    {
        // Validate tenant exists
        var tenantExists = await _dbContext.Set<TenantEntity>()
            .AnyAsync(x => x.Id == request.TenantId, cancellationToken);
        
        if (!tenantExists)
        {
            return Result.Failure<ApplicationClientDto>("TENANT_NOT_FOUND", "Tenant not found");
        }
        
        var clientId = Guid.NewGuid().ToString("N");
        var existingClient = await _applicationClientRepository.GetByClientIdAsync(clientId, cancellationToken);
        if (existingClient != null)
        {
            clientId = Guid.NewGuid().ToString("N");
        }

        var applicationClient = new ApplicationClient
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            ClientId = clientId,
            Name = request.Name,
            ApplicationType = request.ApplicationType,
            GrantType = request.GrantType,
            CreatedAt = DateTime.UtcNow
        };

        var createdClient = await _applicationClientRepository.AddAsync(applicationClient, cancellationToken);

        var redirectUris = new List<ClientRedirectUriEntity>();
        foreach (var uri in request.RedirectUris)
        {
            redirectUris.Add(new ClientRedirectUriEntity
            {
                Id = Guid.NewGuid(),
                ApplicationClientId = createdClient.Id,
                Uri = uri,
                CreatedAt = DateTime.UtcNow
            });
        }
        await _dbContext.Set<ClientRedirectUriEntity>().AddRangeAsync(redirectUris, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var savedUris = await _dbContext.Set<ClientRedirectUriEntity>()
            .Where(x => x.ApplicationClientId == createdClient.Id)
            .ToListAsync(cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = null, // Admin user ID should be passed from request
            EventType = AuditEventType.ApplicationCreated,
            Description = $"Application '{request.Name}' was created",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { ApplicationId = createdClient.Id, ApplicationName = request.Name, ClientId = createdClient.ClientId })
        }, cancellationToken);

        return Result.Success(new ApplicationClientDto
        {
            Id = createdClient.Id,
            TenantId = createdClient.TenantId,
            ClientId = createdClient.ClientId,
            Name = createdClient.Name,
            ApplicationType = createdClient.ApplicationType,
            GrantType = createdClient.GrantType,
            RedirectUris = savedUris.Select(x => new RedirectUriDto
            {
                Id = x.Id,
                Uri = x.Uri
            }).ToList(),
            CreatedAt = createdClient.CreatedAt,
            UpdatedAt = createdClient.UpdatedAt
        });
    }
}

