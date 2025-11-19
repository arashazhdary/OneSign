using MediatR;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Observability.Application.Queries;

public class GetAuditEventByIdQueryHandler : IRequestHandler<GetAuditEventByIdQuery, Result<AuditEventDto>>
{
    private readonly IAuditEventRepository _auditEventRepository;

    public GetAuditEventByIdQueryHandler(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task<Result<AuditEventDto>> Handle(GetAuditEventByIdQuery request, CancellationToken cancellationToken)
    {
        var auditEvent = await _auditEventRepository.GetByIdAsync(request.Id, cancellationToken);

        if (auditEvent == null)
        {
            return Result.Failure<AuditEventDto>("AUDIT_EVENT_NOT_FOUND", "Audit event not found");
        }

        var dto = new AuditEventDto
        {
            Id = auditEvent.Id,
            TenantId = auditEvent.TenantId,
            CorrelationId = auditEvent.CorrelationId,
            Category = auditEvent.Category,
            Severity = auditEvent.Severity,
            ActorId = auditEvent.ActorId,
            ActorDisplayName = auditEvent.ActorDisplayName,
            ActorType = auditEvent.ActorType,
            Action = auditEvent.Action,
            TargetType = auditEvent.TargetType,
            TargetId = auditEvent.TargetId,
            IpAddress = auditEvent.IpAddress,
            UserAgent = auditEvent.UserAgent,
            Country = auditEvent.Country,
            OccurredAt = auditEvent.OccurredAt,
            DataJson = auditEvent.DataJson
        };

        return Result.Success(dto);
    }
}
