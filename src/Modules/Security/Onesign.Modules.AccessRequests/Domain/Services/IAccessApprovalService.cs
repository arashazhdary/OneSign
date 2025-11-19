using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Services;

public interface IAccessApprovalService
{
    Task<ApprovalStep> CreateApprovalStepAsync(AccessRequest request, int stepNumber, Guid approverId, string approverName, bool isRequired, CancellationToken cancellationToken = default);
    Task<bool> ApproveStepAsync(Guid stepId, Guid approverId, string? comment, CancellationToken cancellationToken = default);
    Task<bool> RejectStepAsync(Guid stepId, Guid approverId, string? comment, CancellationToken cancellationToken = default);
    Task<bool> EscalateStepAsync(Guid stepId, Guid newApproverId, string newApproverName, string? reason, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApprovalStep>> GetPendingStepsForApproverAsync(Guid tenantId, Guid approverId, CancellationToken cancellationToken = default);
    Task<bool> CheckAllStepsCompletedAsync(Guid requestId, CancellationToken cancellationToken = default);
}
