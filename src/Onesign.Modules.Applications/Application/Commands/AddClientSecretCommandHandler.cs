using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Result;
using System.Security.Cryptography;
using System.Text;

namespace Onesign.Modules.Applications.Application.Commands;

public class AddClientSecretCommandHandler : IRequestHandler<AddClientSecretCommand, Result<ClientSecretDto>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly IClientSecretRepository _clientSecretRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<AddClientSecretCommandHandler> _logger;

    public AddClientSecretCommandHandler(
        IApplicationClientRepository applicationClientRepository,
        IClientSecretRepository clientSecretRepository,
        IMediator mediator,
        ILogger<AddClientSecretCommandHandler> logger)
    {
        _applicationClientRepository = applicationClientRepository;
        _clientSecretRepository = clientSecretRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<ClientSecretDto>> Handle(AddClientSecretCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Adding client secret for application {ApplicationId}, TenantId: {TenantId}", request.ApplicationId, request.TenantId);

        var application = await _applicationClientRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null)
        {
            _logger.LogWarning("Application not found: {ApplicationId}", request.ApplicationId);
            return Result.Failure<ClientSecretDto>("APPLICATION_NOT_FOUND", "Application not found");
        }

        if (application.TenantId != request.TenantId)
        {
            _logger.LogWarning("Tenant mismatch for application {ApplicationId}", request.ApplicationId);
            return Result.Failure<ClientSecretDto>("TENANT_MISMATCH", "Application does not belong to this tenant");
        }

        // Generate a secure random secret
        var secretBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(secretBytes);
        var secret = Convert.ToBase64String(secretBytes);

        // Hash the secret (using SHA256 for simplicity, in production use BCrypt or similar)
        var secretHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));

        var clientSecret = new ClientSecret
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = request.ApplicationId,
            SecretHash = secretHash,
            ExpiresAt = request.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        };

        var createdSecret = await _clientSecretRepository.AddAsync(clientSecret, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = null, // Should be passed from request context
            EventType = AuditEventType.ApplicationClientSecretAdded,
            Description = $"Client secret added for application '{application.Name}'",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { ApplicationId = request.ApplicationId, SecretId = createdSecret.Id })
        }, cancellationToken);

        _logger.LogInformation("Client secret added successfully: {SecretId} for application {ApplicationId}", createdSecret.Id, request.ApplicationId);

        // Return DTO with the plain secret (only shown once - never stored)
        return Result.Success(new ClientSecretDto
        {
            Id = createdSecret.Id,
            ApplicationClientId = createdSecret.ApplicationClientId,
            Secret = secret, // Plain secret returned only once
            ExpiresAt = createdSecret.ExpiresAt,
            CreatedAt = createdSecret.CreatedAt
        });
    }
}

