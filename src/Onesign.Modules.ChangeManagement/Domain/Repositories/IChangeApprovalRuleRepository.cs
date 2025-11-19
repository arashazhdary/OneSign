using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Repositories;

public interface IChangeApprovalRuleRepository
{
    Task<ChangeApprovalRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ChangeApprovalRule?> GetByScopeAndCategoryAsync(string scopeType, Guid scopeId, ChangeCategory category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeApprovalRule>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default);
    Task AddAsync(ChangeApprovalRule rule, CancellationToken cancellationToken = default);
    Task UpdateAsync(ChangeApprovalRule rule, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
