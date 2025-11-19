using Onesign.Modules.ChangeManagement.Domain.Entities;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public interface IApprovalWorkflowService
{
    Task<bool> CanApproveAsync(ChangeSet changeSet, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> HasSufficientApprovalsAsync(ChangeSet changeSet, CancellationToken cancellationToken = default);
    Task<int> GetRequiredApproverCountAsync(ChangeSet changeSet, CancellationToken cancellationToken = default);
}
