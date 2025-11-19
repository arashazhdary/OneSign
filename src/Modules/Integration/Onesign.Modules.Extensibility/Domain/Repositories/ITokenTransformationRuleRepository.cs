using Onesign.Modules.Extensibility.Domain.Entities;

namespace Onesign.Modules.Extensibility.Domain.Repositories;

public interface ITokenTransformationRuleRepository
{
    Task<TokenTransformationRule?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<TokenTransformationRule>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<TokenTransformationRule>> GetByAppIdAsync(Guid tenantId, Guid? appId, CancellationToken ct = default);
    Task<IReadOnlyList<TokenTransformationRule>> GetEnabledByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(TokenTransformationRule rule, CancellationToken ct = default);
    Task UpdateAsync(TokenTransformationRule rule, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
