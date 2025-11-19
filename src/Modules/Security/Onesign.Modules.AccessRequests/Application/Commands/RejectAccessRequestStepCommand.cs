using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class RejectAccessRequestStepCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid RequestId { get; set; }
    public Guid StepId { get; set; }
    public Guid ApproverId { get; set; }
    public string? Comment { get; set; }
}
