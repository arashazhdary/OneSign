using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class RejectAccessRequestStepCommandHandler : IRequestHandler<RejectAccessRequestStepCommand, Result>
{
    private readonly IAccessRequestRepository _repository;
    private readonly IAccessRequestWorkflowEngine _workflowEngine;

    public RejectAccessRequestStepCommandHandler(
        IAccessRequestRepository repository,
        IAccessRequestWorkflowEngine workflowEngine)
    {
        _repository = repository;
        _workflowEngine = workflowEngine;
    }

    public async Task<Result> Handle(RejectAccessRequestStepCommand request, CancellationToken cancellationToken)
    {
        var accessRequest = await _repository.GetByIdAsync(request.RequestId, cancellationToken);
        if (accessRequest == null || accessRequest.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Access request not found");

        var step = accessRequest.ApprovalSteps.FirstOrDefault(s => s.Id == request.StepId);
        if (step == null)
            return Result.Failure("StepNotFound", "Approval step not found");

        if (step.ApproverId != request.ApproverId)
            return Result.Failure("Unauthorized", "You are not authorized to reject this step");

        if (step.Action != null)
            return Result.Failure("AlreadyProcessed", "This step has already been processed");

        var success = await _workflowEngine.ProcessApprovalAsync(
            accessRequest,
            request.StepId,
            approved: false,
            request.Comment,
            cancellationToken);

        return success
            ? Result.Success()
            : Result.Failure("RejectionFailed", "Failed to process rejection");
    }
}
