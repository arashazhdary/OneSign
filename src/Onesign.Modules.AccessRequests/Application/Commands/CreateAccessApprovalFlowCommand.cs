using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class CreateAccessApprovalFlowCommand : IRequest<Result<AccessApprovalFlowDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AccessType { get; set; }
    public string? TargetApplication { get; set; }
    public List<ApprovalFlowStepDto> Steps { get; set; } = new();
    public bool RequireAllApprovals { get; set; } = true;
    public bool IsEnabled { get; set; } = true;
}
