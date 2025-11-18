using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class MfaChallengeRepository : IMfaChallengeRepository
{
    private readonly DbContext _dbContext;

    public MfaChallengeRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MfaChallenge?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MfaChallengeEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task AddAsync(MfaChallenge mfaChallenge, CancellationToken cancellationToken = default)
    {
        var entity = MfaChallengeEntity.FromDomain(mfaChallenge);
        await _dbContext.Set<MfaChallengeEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MfaChallenge mfaChallenge, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MfaChallengeEntity>()
            .FirstOrDefaultAsync(x => x.Id == mfaChallenge.Id, cancellationToken);

        if (entity != null)
        {
            entity.TenantUserId = mfaChallenge.TenantUserId;
            entity.MethodType = mfaChallenge.MethodType;
            entity.CodeHash = mfaChallenge.CodeHash;
            entity.ExpiresAt = mfaChallenge.ExpiresAt;
            entity.Consumed = mfaChallenge.Consumed;
            entity.DeviceId = mfaChallenge.DeviceId;
            entity.IpAddress = mfaChallenge.IpAddress;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteExpiredAsync(DateTime cutoffTime, CancellationToken cancellationToken = default)
    {
        var expiredEntities = await _dbContext.Set<MfaChallengeEntity>()
            .Where(x => x.ExpiresAt < cutoffTime)
            .ToListAsync(cancellationToken);

        _dbContext.Set<MfaChallengeEntity>().RemoveRange(expiredEntities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
