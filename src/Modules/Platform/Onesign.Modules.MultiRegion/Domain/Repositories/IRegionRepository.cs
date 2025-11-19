using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;

namespace Onesign.Modules.MultiRegion.Domain.Repositories;

public interface IRegionRepository
{
    Task<Region?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Region>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Region>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Region>> GetByStatusAsync(RegionStatus status, CancellationToken cancellationToken = default);
    Task AddAsync(Region region, CancellationToken cancellationToken = default);
    Task UpdateAsync(Region region, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
