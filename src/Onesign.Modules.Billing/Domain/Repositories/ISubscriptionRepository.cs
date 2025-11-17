using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Repositories;

public interface ISubscriptionRepository
{
    Task<TenantSubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TenantSubscription?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantSubscription>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<List<TenantSubscription>> GetByStatusAsync(SubscriptionStatus status, CancellationToken cancellationToken = default);
    Task<TenantSubscription> AddAsync(TenantSubscription subscription, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantSubscription subscription, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
