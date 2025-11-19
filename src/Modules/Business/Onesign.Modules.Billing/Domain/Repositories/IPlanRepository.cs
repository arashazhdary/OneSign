using Onesign.Modules.Billing.Domain.Entities;

namespace Onesign.Modules.Billing.Domain.Repositories;

public interface IPlanRepository
{
    Task<Plan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Plan?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Plan>> GetAllAsync(bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Plan> AddAsync(Plan plan, CancellationToken cancellationToken = default);
    Task UpdateAsync(Plan plan, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
