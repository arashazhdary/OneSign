using MediatR;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Observability.Application.Queries;

public class SearchAuditEventsQuery : IRequest<Result<AuditSearchResultDto>>
{
    public AuditSearchFilterDto Filter { get; set; } = new();
}
