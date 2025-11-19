using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Repositories;

public interface ILoginHookRepository
{
    Task<LoginHook?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LoginHook>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<LoginHook>> GetByTenantAndStageAsync(Guid tenantId, HookStage stage, CancellationToken ct = default);
    Task<IReadOnlyList<LoginHook>> GetEnabledByStageAsync(Guid tenantId, HookStage stage, CancellationToken ct = default);
    Task AddAsync(LoginHook hook, CancellationToken ct = default);
    Task UpdateAsync(LoginHook hook, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
