using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class EscalateAccessRequestStepCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid RequestId { get; set; }
    public Guid StepId { get; set; }
    public Guid NewApproverId { get; set; }
    public string NewApproverName { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
