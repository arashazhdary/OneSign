using Microsoft.EntityFrameworkCore;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Repositories;

public class TenantBackupSetRepository : ITenantBackupSetRepository
{
    private readonly DbContext _dbContext;

    public TenantBackupSetRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantBackupSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantBackupSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<TenantBackupSet>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantBackupSetEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TenantBackupSet>> GetByStatusAsync(BackupStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantBackupSetEntity>()
            .Where(x => x.Status == (int)status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<TenantBackupSet?> GetLatestByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantBackupSetEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(TenantBackupSet backupSet, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(backupSet);
        await _dbContext.Set<TenantBackupSetEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(TenantBackupSet backupSet, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantBackupSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == backupSet.Id, cancellationToken);

        if (entity != null)
        {
            entity.Status = (int)backupSet.Status;
            entity.SizeBytes = backupSet.SizeBytes;
            entity.CompletedAt = backupSet.CompletedAt;
            entity.ErrorMessage = backupSet.ErrorMessage;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantBackupSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<TenantBackupSetEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static TenantBackupSet MapToDomain(TenantBackupSetEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        RegionId = e.RegionId,
        CreatedAt = e.CreatedAt,
        BackupType = e.BackupType,
        StorageLocation = e.StorageLocation,
        Status = (BackupStatus)e.Status,
        SizeBytes = e.SizeBytes,
        CompletedAt = e.CompletedAt,
        ErrorMessage = e.ErrorMessage
    };

    private static TenantBackupSetEntity MapToEntity(TenantBackupSet d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        RegionId = d.RegionId,
        CreatedAt = d.CreatedAt,
        BackupType = d.BackupType,
        StorageLocation = d.StorageLocation,
        Status = (int)d.Status,
        SizeBytes = d.SizeBytes,
        CompletedAt = d.CompletedAt,
        ErrorMessage = d.ErrorMessage
    };
}
