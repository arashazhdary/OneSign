using MediatR;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Observability.Application.Queries;

public class GetAuditEventByIdQuery : IRequest<Result<AuditEventDto>>
{
    public Guid Id { get; set; }
}
