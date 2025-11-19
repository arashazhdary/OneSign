using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class UpdateAccessApprovalFlowCommand : IRequest<Result<AccessApprovalFlowDto>>
{
    public Guid TenantId { get; set; }
    public Guid FlowId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<ApprovalFlowStepDto>? Steps { get; set; }
    public bool? RequireAllApprovals { get; set; }
    public bool? IsEnabled { get; set; }
}
