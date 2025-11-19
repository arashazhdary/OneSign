using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class ProcessApprovalCommand : IRequest<Result<bool>>
{
    public Guid RequestId { get; set; }
    public Guid ApproverId { get; set; }
    public bool Approved { get; set; }
    public string? Comment { get; set; }
}
