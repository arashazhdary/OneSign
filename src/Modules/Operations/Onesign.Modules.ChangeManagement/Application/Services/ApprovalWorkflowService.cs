using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public class ApprovalWorkflowService : IApprovalWorkflowService
{
    private readonly IChangeApprovalRuleRepository _ruleRepository;
    private readonly IChangeApprovalRepository _approvalRepository;
    private readonly ILogger<ApprovalWorkflowService> _logger;

    public ApprovalWorkflowService(
        IChangeApprovalRuleRepository ruleRepository,
        IChangeApprovalRepository approvalRepository,
        ILogger<ApprovalWorkflowService> logger)
    {
        _ruleRepository = ruleRepository;
        _approvalRepository = approvalRepository;
        _logger = logger;
    }

    public async Task<bool> CanApproveAsync(ChangeSet changeSet, Guid userId, CancellationToken cancellationToken = default)
    {
        // Cannot approve own change sets (separation of duties)
        if (changeSet.RequestedByUserId == userId)
        {
            _logger.LogDebug("User {UserId} cannot approve their own change set {ChangeSetId}", userId, changeSet.Id);
            return false;
        }

        // Check if user already approved/rejected
        var existingApproval = await _approvalRepository.GetByChangeSetAndUserAsync(changeSet.Id, userId, cancellationToken);
        if (existingApproval != null)
        {
            _logger.LogDebug("User {UserId} has already made a decision on change set {ChangeSetId}", userId, changeSet.Id);
            return false;
        }

        // Get approval rule for this scope and category
        var rule = await _ruleRepository.GetByScopeAndCategoryAsync(
            changeSet.ScopeType, changeSet.ScopeId, changeSet.Category, cancellationToken);

        if (rule != null && rule.RequireSeparationOfDuties)
        {
            // Check if user is different from the requester (already checked above)
            // Additional checks could be added here for organizational separation
            _logger.LogDebug("Separation of duties check passed for user {UserId} on change set {ChangeSetId}", userId, changeSet.Id);
        }

        return true;
    }

    public async Task<bool> HasSufficientApprovalsAsync(ChangeSet changeSet, CancellationToken cancellationToken = default)
    {
        var requiredCount = await GetRequiredApproverCountAsync(changeSet, cancellationToken);
        var approvals = await _approvalRepository.GetByChangeSetIdAsync(changeSet.Id, cancellationToken);

        var approvedCount = approvals.Count(a => a.Decision == ApprovalDecision.Approved);
        var rejectedCount = approvals.Count(a => a.Decision == ApprovalDecision.Rejected);

        // If anyone rejected, the change set cannot be approved
        if (rejectedCount > 0)
        {
            _logger.LogDebug("Change set {ChangeSetId} has {RejectedCount} rejections", changeSet.Id, rejectedCount);
            return false;
        }

        var hasSufficient = approvedCount >= requiredCount;
        _logger.LogDebug("Change set {ChangeSetId}: {ApprovedCount}/{RequiredCount} approvals. Sufficient: {HasSufficient}",
            changeSet.Id, approvedCount, requiredCount, hasSufficient);

        return hasSufficient;
    }

    public async Task<int> GetRequiredApproverCountAsync(ChangeSet changeSet, CancellationToken cancellationToken = default)
    {
        // Try to get specific rule for this scope and category
        var rule = await _ruleRepository.GetByScopeAndCategoryAsync(
            changeSet.ScopeType, changeSet.ScopeId, changeSet.Category, cancellationToken);

        if (rule != null)
        {
            return rule.MinApprovers;
        }

        // Default requirements based on category
        var defaultCount = changeSet.Category switch
        {
            ChangeCategory.AuthorizationPolicy => 2,
            ChangeCategory.FederationConfig => 2,
            ChangeCategory.TenantSecuritySettings => 2,
            ChangeCategory.AutomationWorkflow => 1,
            ChangeCategory.ApplicationConfig => 1,
            _ => 1
        };

        _logger.LogDebug("Using default approval count {Count} for category {Category}",
            defaultCount, changeSet.Category);

        return defaultCount;
    }
}
