using MediatR;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Audit.Application.Commands;

public class AppendAuditEventCommandHandler : IRequestHandler<AppendAuditEventCommand, Result<AuditEventDto>>
{
    private readonly IAuditEventRepository _auditEventRepository;

    public AppendAuditEventCommandHandler(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task<Result<AuditEventDto>> Handle(AppendAuditEventCommand request, CancellationToken cancellationToken)
    {
        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = request.EventType,
            Description = request.Description,
            Metadata = request.Metadata,
            CreatedAt = DateTime.UtcNow,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent
        };

        var createdEvent = await _auditEventRepository.AddAsync(auditEvent, cancellationToken);

        return Result.Success(new AuditEventDto
        {
            Id = createdEvent.Id,
            TenantId = createdEvent.TenantId,
            ActorId = createdEvent.ActorId,
            EventType = createdEvent.EventType,
            Description = createdEvent.Description,
            Metadata = createdEvent.Metadata,
            CreatedAt = createdEvent.CreatedAt,
            IpAddress = createdEvent.IpAddress,
            UserAgent = createdEvent.UserAgent
        });
    }
}

