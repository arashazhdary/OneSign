using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Repositories;

public interface IChangeExecutionLogRepository
{
    Task<IReadOnlyList<ChangeExecutionLog>> GetByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeExecutionLog>> GetByChangeSetAndStepAsync(Guid changeSetId, ExecutionStep step, CancellationToken cancellationToken = default);
    Task AddAsync(ChangeExecutionLog log, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<ChangeExecutionLog> logs, CancellationToken cancellationToken = default);
}
