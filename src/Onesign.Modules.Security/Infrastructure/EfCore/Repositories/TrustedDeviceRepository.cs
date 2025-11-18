using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class TrustedDeviceRepository : ITrustedDeviceRepository
{
    private readonly DbContext _dbContext;

    public TrustedDeviceRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TrustedDevice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TrustedDeviceEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<TrustedDevice>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TrustedDeviceEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<TrustedDevice?> GetByDeviceIdAsync(Guid tenantUserId, string deviceId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TrustedDeviceEntity>()
            .FirstOrDefaultAsync(x => x.TenantUserId == tenantUserId && x.DeviceId == deviceId, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task AddAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken = default)
    {
        var entity = TrustedDeviceEntity.FromDomain(trustedDevice);
        await _dbContext.Set<TrustedDeviceEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TrustedDeviceEntity>()
            .FirstOrDefaultAsync(x => x.Id == trustedDevice.Id, cancellationToken);

        if (entity != null)
        {
            entity.TenantUserId = trustedDevice.TenantUserId;
            entity.DeviceId = trustedDevice.DeviceId;
            entity.DeviceName = trustedDevice.DeviceName;
            entity.FirstSeenAt = trustedDevice.FirstSeenAt;
            entity.LastSeenAt = trustedDevice.LastSeenAt;
            entity.ExpiresAt = trustedDevice.ExpiresAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TrustedDeviceEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<TrustedDeviceEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
