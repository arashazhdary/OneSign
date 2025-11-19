using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Repositories;

public interface IAutomationExecutionRepository
{
    Task<AutomationExecution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AutomationExecution>> GetByTenantIdAsync(
        Guid tenantId,
        Guid? workflowId = null,
        ExecutionStatus? status = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
    Task<int> GetCountByTenantIdAsync(
        Guid tenantId,
        Guid? workflowId = null,
        ExecutionStatus? status = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid workflowId, string eventId, CancellationToken cancellationToken = default);
    Task AddAsync(AutomationExecution execution, CancellationToken cancellationToken = default);
    Task UpdateAsync(AutomationExecution execution, CancellationToken cancellationToken = default);
}
