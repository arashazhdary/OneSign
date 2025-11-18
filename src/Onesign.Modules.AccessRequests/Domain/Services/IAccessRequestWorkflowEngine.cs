using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Services;

public interface IAccessRequestWorkflowEngine
{
    Task InitializeWorkflowAsync(AccessRequest request, CancellationToken cancellationToken = default);
    Task<bool> ProcessApprovalAsync(AccessRequest request, Guid stepId, bool approved, string? comment, CancellationToken cancellationToken = default);
    Task<bool> CancelWorkflowAsync(AccessRequest request, string? reason, CancellationToken cancellationToken = default);
    Task<bool> EscalateStepAsync(AccessRequest request, Guid stepId, Guid newApproverId, string newApproverName, string? reason, CancellationToken cancellationToken = default);
    Task CheckAndProcessSlaBreachesAsync(CancellationToken cancellationToken = default);
}
