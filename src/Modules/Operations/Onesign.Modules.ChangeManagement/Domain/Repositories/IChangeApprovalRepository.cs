using Onesign.Modules.ChangeManagement.Domain.Entities;

namespace Onesign.Modules.ChangeManagement.Domain.Repositories;

public interface IChangeApprovalRepository
{
    Task<ChangeApproval?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeApproval>> GetByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default);
    Task<ChangeApproval?> GetByChangeSetAndUserAsync(Guid changeSetId, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(ChangeApproval approval, CancellationToken cancellationToken = default);
    Task DeleteByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default);
}
