using Onesign.Modules.AccountCenter.Domain.Entities;

namespace Onesign.Modules.AccountCenter.Domain.Repositories;

public interface IUserDeviceRepository
{
    Task<List<UserDevice>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserDevice?> GetByDeviceIdAsync(Guid userId, string deviceId, CancellationToken cancellationToken = default);
    Task<UserDevice> AddAsync(UserDevice device, CancellationToken cancellationToken = default);
    Task UpdateAsync(UserDevice device, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
