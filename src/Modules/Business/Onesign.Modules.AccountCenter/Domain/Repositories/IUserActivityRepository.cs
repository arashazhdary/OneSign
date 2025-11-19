using Onesign.Modules.AccountCenter.Domain.Entities;

namespace Onesign.Modules.AccountCenter.Domain.Repositories;

public interface IUserActivityRepository
{
    Task<List<UserActivity>> GetByUserIdAsync(Guid userId, DateTime from, DateTime to, int skip, int take, CancellationToken cancellationToken = default);
    Task<UserActivity> AddAsync(UserActivity activity, CancellationToken cancellationToken = default);
    Task<int> GetCountAsync(Guid userId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
}
