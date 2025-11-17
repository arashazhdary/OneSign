using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Queries;

public class GetAccessRequestsQuery : IRequest<Result<List<AccessRequestDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? RequesterId { get; set; }
    public Guid? ApproverId { get; set; }
}
