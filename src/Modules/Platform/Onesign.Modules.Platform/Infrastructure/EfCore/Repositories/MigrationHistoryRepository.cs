using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Repositories;

public class MigrationHistoryRepository : IMigrationHistoryRepository
{
    private readonly OnesignDbContext _dbContext;

    public MigrationHistoryRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MigrationHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MigrationHistoryEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<MigrationHistory?> GetByNameAsync(string migrationName, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MigrationHistoryEntity>()
            .FirstOrDefaultAsync(x => x.MigrationName == migrationName, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<MigrationHistory>> GetAllAsync(int page, int pageSize, MigrationStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<MigrationHistoryEntity>().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == (int)status.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.AppliedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetTotalCountAsync(MigrationStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<MigrationHistoryEntity>().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == (int)status.Value);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MigrationHistory>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<MigrationHistoryEntity>()
            .Where(x => x.Status == (int)MigrationStatus.Pending)
            .OrderBy(x => x.MigrationName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<MigrationHistory?> GetLatestMigrationAsync(CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MigrationHistoryEntity>()
            .OrderByDescending(x => x.AppliedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(MigrationHistory migration, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(migration);
        await _dbContext.Set<MigrationHistoryEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MigrationHistory migration, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<MigrationHistoryEntity>()
            .FirstOrDefaultAsync(x => x.Id == migration.Id, cancellationToken);

        if (existing == null)
            return;

        existing.MigrationName = migration.MigrationName;
        existing.AppliedAt = migration.AppliedAt;
        existing.AppliedByUserId = migration.AppliedByUserId;
        existing.Status = (int)migration.Status;
        existing.ErrorMessage = migration.ErrorMessage;
        existing.DurationTicks = migration.Duration.Ticks;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static MigrationHistory MapToDomain(MigrationHistoryEntity e) => new()
    {
        Id = e.Id,
        MigrationName = e.MigrationName,
        AppliedAt = e.AppliedAt,
        AppliedByUserId = e.AppliedByUserId,
        Status = (MigrationStatus)e.Status,
        ErrorMessage = e.ErrorMessage,
        Duration = TimeSpan.FromTicks(e.DurationTicks)
    };

    private static MigrationHistoryEntity MapToEntity(MigrationHistory d) => new()
    {
        Id = d.Id,
        MigrationName = d.MigrationName,
        AppliedAt = d.AppliedAt,
        AppliedByUserId = d.AppliedByUserId,
        Status = (int)d.Status,
        ErrorMessage = d.ErrorMessage,
        DurationTicks = d.Duration.Ticks
    };
}
