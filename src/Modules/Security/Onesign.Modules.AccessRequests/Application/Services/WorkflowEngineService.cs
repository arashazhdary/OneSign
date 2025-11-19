using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;

namespace Onesign.Modules.AccessRequests.Application.Services;

public class WorkflowEngineService : IWorkflowEngine
{
    private readonly IAccessRequestRepository _requestRepository;
    private readonly IWorkflowDefinitionRepository _workflowRepository;

    public WorkflowEngineService(
        IAccessRequestRepository requestRepository,
        IWorkflowDefinitionRepository workflowRepository)
    {
        _requestRepository = requestRepository;
        _workflowRepository = workflowRepository;
    }

    public async Task InitializeWorkflowAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        // Simplified workflow initialization - create approval steps based on workflow definition
        // In production, this would be more sophisticated with dynamic approver resolution

        var approvalSteps = new List<ApprovalStep>
        {
            new()
            {
                Id = Guid.NewGuid(),
                AccessRequestId = request.Id,
                StepNumber = 1,
                ApproverId = Guid.Empty, // Would be resolved from workflow definition
                ApproverName = "Manager",
                IsRequired = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                AccessRequestId = request.Id,
                StepNumber = 2,
                ApproverId = Guid.Empty, // Would be resolved from workflow definition
                ApproverName = "Security Officer",
                IsRequired = true
            }
        };

        request.ApprovalSteps = approvalSteps;
        request.Status = RequestStatus.InReview;

        await _requestRepository.UpdateAsync(request, cancellationToken);
    }

    public async Task ProcessApprovalAsync(Guid requestId, Guid approverId, bool approved, string? comment, CancellationToken cancellationToken = default)
    {
        var request = await _requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null)
            throw new InvalidOperationException("Request not found");

        var currentStep = request.ApprovalSteps
            .Where(s => s.Action == null)
            .OrderBy(s => s.StepNumber)
            .FirstOrDefault();

        if (currentStep == null)
            return; // All steps completed

        currentStep.Action = approved ? ApprovalAction.Approve : ApprovalAction.Reject;
        currentStep.Comment = comment;
        currentStep.ActionAt = DateTime.UtcNow;

        if (!approved)
        {
            request.Status = RequestStatus.Rejected;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedBy = approverId;
            request.ReviewComment = comment;
        }
        else
        {
            var allApproved = request.ApprovalSteps.All(s => s.Action == ApprovalAction.Approve || !s.IsRequired);
            if (allApproved)
            {
                request.Status = RequestStatus.Approved;
                request.ReviewedAt = DateTime.UtcNow;
                request.ReviewedBy = approverId;
            }
        }

        await _requestRepository.UpdateAsync(request, cancellationToken);
    }
}
