using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Repositories;

public class UserActivityRepository : IUserActivityRepository
{
    private readonly DbContext _dbContext;

    public UserActivityRepository(DbContext dbContext) => _dbContext = dbContext;

    public async Task<List<UserActivity>> GetByUserIdAsync(Guid userId, DateTime from, DateTime to, int skip, int take, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserActivityEntity>()
            .Where(x => x.UserId == userId && x.OccurredAt >= from && x.OccurredAt <= to)
            .OrderByDescending(x => x.OccurredAt)
            .Skip(skip).Take(take)
            .ToListAsync(cancellationToken);

        return entities.Select(e => new UserActivity
        {
            Id = e.Id,
            TenantId = e.TenantId,
            UserId = e.UserId,
            ActivityType = e.ActivityType,
            Description = e.Description,
            IpAddress = e.IpAddress,
            UserAgent = e.UserAgent,
            DeviceId = e.DeviceId,
            OccurredAt = e.OccurredAt,
            Metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(e.MetadataJson) ?? new()
        }).ToList();
    }

    public async Task<UserActivity> AddAsync(UserActivity activity, CancellationToken cancellationToken = default)
    {
        var entity = new UserActivityEntity
        {
            Id = activity.Id,
            TenantId = activity.TenantId,
            UserId = activity.UserId,
            ActivityType = activity.ActivityType,
            Description = activity.Description,
            IpAddress = activity.IpAddress,
            UserAgent = activity.UserAgent,
            DeviceId = activity.DeviceId,
            OccurredAt = activity.OccurredAt,
            MetadataJson = JsonSerializer.Serialize(activity.Metadata)
        };
        _dbContext.Set<UserActivityEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return activity;
    }

    public async Task<int> GetCountAsync(Guid userId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<UserActivityEntity>()
            .CountAsync(x => x.UserId == userId && x.OccurredAt >= from && x.OccurredAt <= to, cancellationToken);
    }
}
