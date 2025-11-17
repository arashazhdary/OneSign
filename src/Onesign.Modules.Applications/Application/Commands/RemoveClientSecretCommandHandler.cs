using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class RemoveClientSecretCommandHandler : IRequestHandler<RemoveClientSecretCommand, Result>
{
    private readonly IClientSecretRepository _clientSecretRepository;
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly IMediator _mediator;
    private readonly ILogger<RemoveClientSecretCommandHandler> _logger;

    public RemoveClientSecretCommandHandler(
        IClientSecretRepository clientSecretRepository,
        IApplicationClientRepository applicationClientRepository,
        IMediator mediator,
        ILogger<RemoveClientSecretCommandHandler> logger)
    {
        _clientSecretRepository = clientSecretRepository;
        _applicationClientRepository = applicationClientRepository;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result> Handle(RemoveClientSecretCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Removing client secret {SecretId}, TenantId: {TenantId}", request.SecretId, request.TenantId);

        var secret = await _clientSecretRepository.GetByIdAsync(request.SecretId, cancellationToken);
        if (secret == null)
        {
            _logger.LogWarning("Client secret not found: {SecretId}", request.SecretId);
            return Result.Failure("SECRET_NOT_FOUND", "Client secret not found");
        }

        var application = await _applicationClientRepository.GetByIdAsync(secret.ApplicationClientId, cancellationToken);
        if (application == null)
        {
            _logger.LogWarning("Application not found for secret {SecretId}", request.SecretId);
            return Result.Failure("APPLICATION_NOT_FOUND", "Application not found");
        }

        if (application.TenantId != request.TenantId)
        {
            _logger.LogWarning("Tenant mismatch for secret {SecretId}", request.SecretId);
            return Result.Failure("TENANT_MISMATCH", "Secret does not belong to this tenant");
        }

        await _clientSecretRepository.DeleteAsync(request.SecretId, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = null, // Should be passed from request context
            EventType = AuditEventType.ApplicationClientSecretRemoved,
            Description = $"Client secret removed for application '{application.Name}'",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { ApplicationId = secret.ApplicationClientId, SecretId = request.SecretId })
        }, cancellationToken);

        _logger.LogInformation("Client secret removed successfully: {SecretId}", request.SecretId);

        return Result.Success();
    }
}

