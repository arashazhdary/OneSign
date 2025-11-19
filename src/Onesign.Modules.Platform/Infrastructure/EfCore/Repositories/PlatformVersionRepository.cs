using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Repositories;

public class PlatformVersionRepository : IPlatformVersionRepository
{
    private readonly OnesignDbContext _dbContext;

    public PlatformVersionRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PlatformVersion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlatformVersionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<PlatformVersion?> GetCurrentVersionAsync(CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlatformVersionEntity>()
            .FirstOrDefaultAsync(x => x.IsCurrentVersion, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<PlatformVersion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<PlatformVersionEntity>()
            .OrderByDescending(x => x.ReleaseDate)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<PlatformVersion>> GetVersionHistoryAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<PlatformVersionEntity>()
            .OrderByDescending(x => x.ReleaseDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<PlatformVersionEntity>().CountAsync(cancellationToken);
    }

    public async Task AddAsync(PlatformVersion version, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(version);
        await _dbContext.Set<PlatformVersionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(PlatformVersion version, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<PlatformVersionEntity>()
            .FirstOrDefaultAsync(x => x.Id == version.Id, cancellationToken);

        if (existing == null)
            return;

        existing.Version = version.Version;
        existing.ReleaseDate = version.ReleaseDate;
        existing.Description = version.Description;
        existing.ReleaseNotes = version.ReleaseNotes;
        existing.IsCurrentVersion = version.IsCurrentVersion;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task SetCurrentVersionAsync(Guid versionId, CancellationToken cancellationToken = default)
    {
        var allVersions = await _dbContext.Set<PlatformVersionEntity>().ToListAsync(cancellationToken);

        foreach (var version in allVersions)
        {
            version.IsCurrentVersion = version.Id == versionId;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static PlatformVersion MapToDomain(PlatformVersionEntity e) => new()
    {
        Id = e.Id,
        Version = e.Version,
        ReleaseDate = e.ReleaseDate,
        Description = e.Description,
        ReleaseNotes = e.ReleaseNotes,
        IsCurrentVersion = e.IsCurrentVersion,
        CreatedAt = e.CreatedAt
    };

    private static PlatformVersionEntity MapToEntity(PlatformVersion d) => new()
    {
        Id = d.Id,
        Version = d.Version,
        ReleaseDate = d.ReleaseDate,
        Description = d.Description,
        ReleaseNotes = d.ReleaseNotes,
        IsCurrentVersion = d.IsCurrentVersion,
        CreatedAt = d.CreatedAt
    };
}
