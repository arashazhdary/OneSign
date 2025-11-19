using MediatR;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class DeleteApplicationClientCommandHandler : IRequestHandler<DeleteApplicationClientCommand, Result<bool>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly IMediator _mediator;

    public DeleteApplicationClientCommandHandler(
        IApplicationClientRepository applicationClientRepository,
        IMediator mediator)
    {
        _applicationClientRepository = applicationClientRepository;
        _mediator = mediator;
    }

    public async Task<Result<bool>> Handle(DeleteApplicationClientCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationClientRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null || application.TenantId != request.TenantId)
        {
            return Result.Failure<bool>("APPLICATION_NOT_FOUND", "Application not found");
        }

        var tenantId = application.TenantId;
        var applicationName = application.Name;
        var clientId = application.ClientId;

        await _applicationClientRepository.DeleteAsync(request.ApplicationId, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = tenantId,
            ActorId = null, // Admin user ID should be passed from request
            EventType = AuditEventType.ApplicationDeleted,
            Description = $"Application '{applicationName}' was deleted",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { ApplicationId = request.ApplicationId, ApplicationName = applicationName, ClientId = clientId })
        }, cancellationToken);

        return Result.Success(true);
    }
}

