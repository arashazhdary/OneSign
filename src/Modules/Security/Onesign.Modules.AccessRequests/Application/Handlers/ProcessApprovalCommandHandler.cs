using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class ProcessApprovalCommandHandler : IRequestHandler<ProcessApprovalCommand, Result<bool>>
{
    private readonly IWorkflowEngine _workflowEngine;

    public ProcessApprovalCommandHandler(IWorkflowEngine workflowEngine)
    {
        _workflowEngine = workflowEngine;
    }

    public async Task<Result<bool>> Handle(ProcessApprovalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _workflowEngine.ProcessApprovalAsync(
                request.RequestId,
                request.ApproverId,
                request.Approved,
                request.Comment,
                cancellationToken);

            return Result.Success(true);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>("ProcessApprovalFailed", ex.Message);
        }
    }
}
