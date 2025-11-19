using Onesign.Modules.Automation.Domain.Entities;

namespace Onesign.Modules.Automation.Domain.Repositories;

public interface IAutomationWorkflowRepository
{
    Task<AutomationWorkflow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AutomationWorkflow?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AutomationWorkflow>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AutomationWorkflow>> GetGlobalTemplatesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AutomationWorkflow>> GetEnforcedGlobalWorkflowsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AutomationWorkflow>> GetByEventTypeAsync(Guid? tenantId, string eventType, CancellationToken cancellationToken = default);
    Task AddAsync(AutomationWorkflow workflow, CancellationToken cancellationToken = default);
    Task UpdateAsync(AutomationWorkflow workflow, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
