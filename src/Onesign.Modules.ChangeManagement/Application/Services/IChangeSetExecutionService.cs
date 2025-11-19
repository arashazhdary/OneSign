using Onesign.Modules.ChangeManagement.Domain.Entities;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public interface IChangeSetExecutionService
{
    Task<bool> ApplyAsync(ChangeSet changeSet, Guid executedByUserId, CancellationToken cancellationToken = default);
    Task<bool> RollbackAsync(ChangeSet changeSet, Guid executedByUserId, string reason, CancellationToken cancellationToken = default);
}
