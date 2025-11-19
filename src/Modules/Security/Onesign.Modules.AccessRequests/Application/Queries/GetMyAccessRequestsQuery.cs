using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Queries;

public class GetMyAccessRequestsQuery : IRequest<Result<List<AccessRequestDto>>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? Status { get; set; }
}
