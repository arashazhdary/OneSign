using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Queries;

public class GetAccessApprovalFlowsQuery : IRequest<Result<List<AccessApprovalFlowDto>>>
{
    public Guid TenantId { get; set; }
    public string? AccessType { get; set; }
}
