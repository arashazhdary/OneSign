using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Services;

public interface IWorkflowEngine
{
    Task InitializeWorkflowAsync(AccessRequest request, CancellationToken cancellationToken = default);
    Task ProcessApprovalAsync(Guid requestId, Guid approverId, bool approved, string? comment, CancellationToken cancellationToken = default);
}
