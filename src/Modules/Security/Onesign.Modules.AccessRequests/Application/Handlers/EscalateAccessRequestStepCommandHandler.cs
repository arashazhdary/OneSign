using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class EscalateAccessRequestStepCommandHandler : IRequestHandler<EscalateAccessRequestStepCommand, Result>
{
    private readonly IAccessRequestRepository _repository;
    private readonly IAccessRequestWorkflowEngine _workflowEngine;

    public EscalateAccessRequestStepCommandHandler(
        IAccessRequestRepository repository,
        IAccessRequestWorkflowEngine workflowEngine)
    {
        _repository = repository;
        _workflowEngine = workflowEngine;
    }

    public async Task<Result> Handle(EscalateAccessRequestStepCommand request, CancellationToken cancellationToken)
    {
        var accessRequest = await _repository.GetByIdAsync(request.RequestId, cancellationToken);
        if (accessRequest == null || accessRequest.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Access request not found");

        var step = accessRequest.ApprovalSteps.FirstOrDefault(s => s.Id == request.StepId);
        if (step == null)
            return Result.Failure("StepNotFound", "Approval step not found");

        if (step.Action != null)
            return Result.Failure("AlreadyProcessed", "This step has already been processed");

        var success = await _workflowEngine.EscalateStepAsync(
            accessRequest,
            request.StepId,
            request.NewApproverId,
            request.NewApproverName,
            request.Reason,
            cancellationToken);

        return success
            ? Result.Success()
            : Result.Failure("EscalationFailed", "Failed to escalate approval step");
    }
}
