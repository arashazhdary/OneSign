using Microsoft.EntityFrameworkCore;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Repositories;

public class SecuritySignalRepository : ISecuritySignalRepository
{
    private readonly DbContext _dbContext;

    public SecuritySignalRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SecuritySignal?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<SecuritySignalEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<SecuritySignal>> GetByTenantAsync(Guid tenantId, int limit = 100, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<SecuritySignalEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.DetectedAt)
            .Take(limit)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SecuritySignal>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<SecuritySignalEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SecuritySignal>> GetRecentSignalsAsync(Guid tenantId, Guid userId, TimeSpan window, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow - window;
        var entities = await _dbContext.Set<SecuritySignalEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId && x.DetectedAt >= cutoff)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SecuritySignal>> GetByTypeAsync(Guid tenantId, SecuritySignalType signalType, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<SecuritySignalEntity>()
            .Where(x => x.TenantId == tenantId && x.SignalType == (int)signalType)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SecuritySignal>> GetUnprocessedAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<SecuritySignalEntity>()
            .Where(x => x.TenantId == tenantId && x.ProcessedAt == null)
            .OrderBy(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(SecuritySignal signal, CancellationToken ct = default)
    {
        var entity = MapToEntity(signal);
        await _dbContext.Set<SecuritySignalEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(SecuritySignal signal, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<SecuritySignalEntity>()
            .FirstOrDefaultAsync(x => x.Id == signal.Id, ct);
        if (entity != null)
        {
            entity.ProcessedAt = signal.ProcessedAt;
            entity.ActionTaken = signal.ActionTaken;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static SecuritySignal MapToDomain(SecuritySignalEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        UserId = entity.UserId,
        SessionId = entity.SessionId,
        SignalType = (SecuritySignalType)entity.SignalType,
        RiskScore = entity.RiskScore,
        DetailsJson = entity.DetailsJson,
        DetectedAt = entity.DetectedAt,
        ProcessedAt = entity.ProcessedAt,
        ActionTaken = entity.ActionTaken
    };

    private static SecuritySignalEntity MapToEntity(SecuritySignal signal) => new()
    {
        Id = signal.Id,
        TenantId = signal.TenantId,
        UserId = signal.UserId,
        SessionId = signal.SessionId,
        SignalType = (int)signal.SignalType,
        RiskScore = signal.RiskScore,
        DetailsJson = signal.DetailsJson,
        DetectedAt = signal.DetectedAt,
        ProcessedAt = signal.ProcessedAt,
        ActionTaken = signal.ActionTaken
    };
}
