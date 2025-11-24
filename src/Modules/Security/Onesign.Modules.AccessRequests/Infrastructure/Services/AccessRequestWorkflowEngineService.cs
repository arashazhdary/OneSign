using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;

namespace Onesign.Modules.AccessRequests.Infrastructure.Services;

public class AccessRequestWorkflowEngineService : IAccessRequestWorkflowEngine
{
    private readonly IAccessRequestRepository _requestRepository;
    private readonly IAccessApprovalFlowRepository _flowRepository;
    private readonly IAccessRequestProvisioningService _provisioningService;
    private readonly ILogger<AccessRequestWorkflowEngineService> _logger;

    public AccessRequestWorkflowEngineService(
        IAccessRequestRepository requestRepository,
        IAccessApprovalFlowRepository flowRepository,
        IAccessRequestProvisioningService provisioningService,
        ILogger<AccessRequestWorkflowEngineService> logger)
    {
        _requestRepository = requestRepository;
        _flowRepository = flowRepository;
        _provisioningService = provisioningService;
        _logger = logger;
    }

    public async Task InitializeWorkflowAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        var accessTypes = request.Items.Select(i => i.AccessType.ToString()).Distinct().ToList();

        foreach (var accessType in accessTypes)
        {
            var flow = await _flowRepository.GetByAccessTypeAsync(request.TenantId, accessType, cancellationToken);
            if (flow == null || !flow.IsEnabled)
            {
                _logger.LogWarning("No approval flow found for access type {AccessType}, using default approver", accessType);
                request.ApprovalSteps.Add(new ApprovalStep
                {
                    Id = Guid.NewGuid(),
                    AccessRequestId = request.Id,
                    StepNumber = 1,
                    ApproverId = request.RequesterId, // Default to self-approval for demo
                    ApproverName = "Default Approver",
                    IsRequired = true
                });
                continue;
            }

            var steps = JsonSerializer.Deserialize<List<ApprovalFlowStep>>(flow.StepsJson) ?? new();
            foreach (var stepDef in steps)
            {
                request.ApprovalSteps.Add(new ApprovalStep
                {
                    Id = Guid.NewGuid(),
                    AccessRequestId = request.Id,
                    StepNumber = stepDef.StepNumber,
                    ApproverId = stepDef.ApproverId ?? request.RequesterId,
                    ApproverName = stepDef.ApproverType,
                    IsRequired = stepDef.IsRequired
                });
            }
        }

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Workflow initialized for request {RequestId} with {StepCount} steps",
            request.Id, request.ApprovalSteps.Count);
    }

    public async Task<bool> ProcessApprovalAsync(AccessRequest request, Guid stepId, bool approved, string? comment, CancellationToken cancellationToken = default)
    {
        var step = request.ApprovalSteps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
            return false;

        step.Action = approved ? ApprovalAction.Approve : ApprovalAction.Reject;
        step.Comment = comment;
        step.ActionAt = DateTime.UtcNow;

        if (!approved)
        {
            request.Status = RequestStatus.Rejected;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedBy = step.ApproverId;
            request.ReviewComment = comment;

            foreach (var item in request.Items)
            {
                item.Status = RequestStatus.Rejected;
            }

            await _requestRepository.UpdateAsync(request, cancellationToken);
            _logger.LogInformation("Request {RequestId} rejected at step {StepId}", request.Id, stepId);
            return true;
        }

        // Check if all required steps are approved
        var allRequiredApproved = request.ApprovalSteps
            .Where(s => s.IsRequired)
            .All(s => s.Action == ApprovalAction.Approve);

        if (allRequiredApproved)
        {
            request.Status = RequestStatus.Approved;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedBy = step.ApproverId;

            foreach (var item in request.Items)
            {
                item.Status = RequestStatus.Approved;
            }

            // Provision access
            await _provisioningService.ProvisionAccessAsync(request, cancellationToken);
            _logger.LogInformation("Request {RequestId} fully approved and provisioned", request.Id);
        }

        await _requestRepository.UpdateAsync(request, cancellationToken);
        return true;
    }

    public async Task<bool> CancelWorkflowAsync(AccessRequest request, string? reason, CancellationToken cancellationToken = default)
    {
        request.Status = RequestStatus.Cancelled;
        request.ReviewComment = reason;

        foreach (var item in request.Items)
        {
            item.Status = RequestStatus.Cancelled;
        }

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Workflow cancelled for request {RequestId}", request.Id);
        return true;
    }

    public async Task<bool> EscalateStepAsync(AccessRequest request, Guid stepId, Guid newApproverId, string newApproverName, string? reason, CancellationToken cancellationToken = default)
    {
        var step = request.ApprovalSteps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
            return false;

        step.ApproverId = newApproverId;
        step.ApproverName = newApproverName;
        step.Comment = $"Escalated: {reason}";

        await _requestRepository.UpdateAsync(request, cancellationToken);
        _logger.LogInformation("Step {StepId} escalated to {NewApproverId} for request {RequestId}",
            stepId, newApproverId, request.Id);
        return true;
    }

    public async Task CheckAndProcessSlaBreachesAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking for SLA breaches...");
        // This would typically query for pending requests past their SLA and auto-escalate or reject
        await Task.CompletedTask;
    }
}
