using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Queries;

public class GetAccessRequestsForApproverQuery : IRequest<Result<List<AccessRequestDto>>>
{
    public Guid TenantId { get; set; }
    public Guid ApproverId { get; set; }
    public bool PendingOnly { get; set; } = true;
}
