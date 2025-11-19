using Microsoft.EntityFrameworkCore;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Repositories;

public class RegionBackupSetRepository : IRegionBackupSetRepository
{
    private readonly DbContext _dbContext;

    public RegionBackupSetRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<RegionBackupSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionBackupSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<RegionBackupSet>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<RegionBackupSetEntity>()
            .Where(x => x.RegionId == regionId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<RegionBackupSet>> GetByStatusAsync(BackupStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<RegionBackupSetEntity>()
            .Where(x => x.Status == (int)status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<RegionBackupSet?> GetLatestByRegionIdAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionBackupSetEntity>()
            .Where(x => x.RegionId == regionId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(RegionBackupSet backupSet, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(backupSet);
        await _dbContext.Set<RegionBackupSetEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(RegionBackupSet backupSet, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionBackupSetEntity>()
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
        var entity = await _dbContext.Set<RegionBackupSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<RegionBackupSetEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static RegionBackupSet MapToDomain(RegionBackupSetEntity e) => new()
    {
        Id = e.Id,
        RegionId = e.RegionId,
        CreatedAt = e.CreatedAt,
        BackupType = e.BackupType,
        StorageLocation = e.StorageLocation,
        Status = (BackupStatus)e.Status,
        SizeBytes = e.SizeBytes,
        CompletedAt = e.CompletedAt,
        ErrorMessage = e.ErrorMessage
    };

    private static RegionBackupSetEntity MapToEntity(RegionBackupSet d) => new()
    {
        Id = d.Id,
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
