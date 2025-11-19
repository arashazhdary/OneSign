using Onesign.Modules.Platform.Domain.Entities;

namespace Onesign.Modules.Platform.Domain.Repositories;

public interface IPlatformVersionRepository
{
    Task<PlatformVersion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PlatformVersion?> GetCurrentVersionAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlatformVersion>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlatformVersion>> GetVersionHistoryAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);
    Task AddAsync(PlatformVersion version, CancellationToken cancellationToken = default);
    Task UpdateAsync(PlatformVersion version, CancellationToken cancellationToken = default);
    Task SetCurrentVersionAsync(Guid versionId, CancellationToken cancellationToken = default);
}
