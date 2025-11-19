using Microsoft.Extensions.Logging;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;

namespace Onesign.Modules.AccessRequests.Infrastructure.Services;

public class AccessApprovalService : IAccessApprovalService
{
    private readonly IAccessRequestRepository _requestRepository;
    private readonly ILogger<AccessApprovalService> _logger;

    public AccessApprovalService(
        IAccessRequestRepository requestRepository,
        ILogger<AccessApprovalService> logger)
    {
        _requestRepository = requestRepository;
        _logger = logger;
    }

    public async Task<ApprovalStep> CreateApprovalStepAsync(
        AccessRequest request,
        int stepNumber,
        Guid approverId,
        string approverName,
        bool isRequired,
        CancellationToken cancellationToken = default)
    {
        var step = new ApprovalStep
        {
            Id = Guid.NewGuid(),
            AccessRequestId = request.Id,
            StepNumber = stepNumber,
            ApproverId = approverId,
            ApproverName = approverName,
            IsRequired = isRequired
        };

        request.ApprovalSteps.Add(step);
        await _requestRepository.UpdateAsync(request, cancellationToken);

        _logger.LogInformation("Created approval step {StepId} for request {RequestId}", step.Id, request.Id);
        return step;
    }

    public async Task<bool> ApproveStepAsync(Guid stepId, Guid approverId, string? comment, CancellationToken cancellationToken = default)
    {
        var request = await FindRequestByStepIdAsync(stepId, cancellationToken);
        if (request == null)
            return false;

        var step = request.ApprovalSteps.First(s => s.Id == stepId);
        if (step.ApproverId != approverId)
        {
            _logger.LogWarning("Unauthorized approval attempt on step {StepId} by {ApproverId}", stepId, approverId);
            return false;
        }

        step.Action = ApprovalAction.Approved;
        step.Comment = comment;
        step.ActionAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Step {StepId} approved by {ApproverId}", stepId, approverId);
        return true;
    }

    public async Task<bool> RejectStepAsync(Guid stepId, Guid approverId, string? comment, CancellationToken cancellationToken = default)
    {
        var request = await FindRequestByStepIdAsync(stepId, cancellationToken);
        if (request == null)
            return false;

        var step = request.ApprovalSteps.First(s => s.Id == stepId);
        if (step.ApproverId != approverId)
        {
            _logger.LogWarning("Unauthorized rejection attempt on step {StepId} by {ApproverId}", stepId, approverId);
            return false;
        }

        step.Action = ApprovalAction.Rejected;
        step.Comment = comment;
        step.ActionAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Step {StepId} rejected by {ApproverId}", stepId, approverId);
        return true;
    }

    public async Task<bool> EscalateStepAsync(Guid stepId, Guid newApproverId, string newApproverName, string? reason, CancellationToken cancellationToken = default)
    {
        var request = await FindRequestByStepIdAsync(stepId, cancellationToken);
        if (request == null)
            return false;

        var step = request.ApprovalSteps.First(s => s.Id == stepId);
        var oldApproverId = step.ApproverId;

        step.ApproverId = newApproverId;
        step.ApproverName = newApproverName;
        step.Comment = $"Escalated from {oldApproverId}: {reason}";

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Step {StepId} escalated from {OldApproverId} to {NewApproverId}",
            stepId, oldApproverId, newApproverId);
        return true;
    }

    public async Task<IReadOnlyList<ApprovalStep>> GetPendingStepsForApproverAsync(Guid tenantId, Guid approverId, CancellationToken cancellationToken = default)
    {
        var requests = await _requestRepository.GetByApproverIdAsync(tenantId, approverId, cancellationToken);
        var pendingSteps = requests
            .SelectMany(r => r.ApprovalSteps)
            .Where(s => s.ApproverId == approverId && s.Action == null)
            .ToList();

        return pendingSteps;
    }

    public async Task<bool> CheckAllStepsCompletedAsync(Guid requestId, CancellationToken cancellationToken = default)
    {
        var request = await _requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null)
            return false;

        return request.ApprovalSteps
            .Where(s => s.IsRequired)
            .All(s => s.Action != null);
    }

    private async Task<AccessRequest?> FindRequestByStepIdAsync(Guid stepId, CancellationToken cancellationToken)
    {
        // This is a simplified implementation - in production, you'd want a more efficient query
        var allRequests = await _requestRepository.GetAllAsync(cancellationToken);
        return allRequests.FirstOrDefault(r => r.ApprovalSteps.Any(s => s.Id == stepId));
    }
}
