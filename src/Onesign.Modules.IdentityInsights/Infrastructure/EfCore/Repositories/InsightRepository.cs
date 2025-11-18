using Microsoft.EntityFrameworkCore;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;

public class InsightRepository : IInsightRepository
{
    private readonly DbContext _dbContext;

    public InsightRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Insight?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<InsightEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<Insight>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<InsightEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Insight>> GetByTenantAndStatusAsync(Guid tenantId, InsightStatus status, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<InsightEntity>()
            .Where(x => x.TenantId == tenantId && x.Status == (int)status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Insight>> GetBySeverityAsync(Guid tenantId, InsightSeverity severity, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<InsightEntity>()
            .Where(x => x.TenantId == tenantId && x.Severity == (int)severity)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Insight>> GetByScopeAsync(Guid tenantId, string scopeType, Guid? scopeId, CancellationToken ct = default)
    {
        var query = _dbContext.Set<InsightEntity>()
            .Where(x => x.TenantId == tenantId && x.ScopeType == scopeType);

        if (scopeId.HasValue)
        {
            query = query.Where(x => x.ScopeId == scopeId.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(Insight insight, CancellationToken ct = default)
    {
        var entity = MapToEntity(insight);
        await _dbContext.Set<InsightEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Insight insight, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<InsightEntity>()
            .FirstOrDefaultAsync(x => x.Id == insight.Id, ct);
        if (entity != null)
        {
            entity.Type = (int)insight.Type;
            entity.Severity = (int)insight.Severity;
            entity.ScopeType = insight.ScopeType;
            entity.ScopeId = insight.ScopeId;
            entity.Title = insight.Title;
            entity.MessageKey = insight.MessageKey;
            entity.DataJson = insight.DataJson;
            entity.Status = (int)insight.Status;
            entity.ResolvedAt = insight.ResolvedAt;
            entity.ResolvedBy = insight.ResolvedBy;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<InsightEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<InsightEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static Insight MapToDomain(InsightEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Type = (InsightType)entity.Type,
        Severity = (InsightSeverity)entity.Severity,
        ScopeType = entity.ScopeType,
        ScopeId = entity.ScopeId,
        Title = entity.Title,
        MessageKey = entity.MessageKey,
        DataJson = entity.DataJson,
        Status = (InsightStatus)entity.Status,
        CreatedAt = entity.CreatedAt,
        ResolvedAt = entity.ResolvedAt,
        ResolvedBy = entity.ResolvedBy
    };

    private static InsightEntity MapToEntity(Insight insight) => new()
    {
        Id = insight.Id,
        TenantId = insight.TenantId,
        Type = (int)insight.Type,
        Severity = (int)insight.Severity,
        ScopeType = insight.ScopeType,
        ScopeId = insight.ScopeId,
        Title = insight.Title,
        MessageKey = insight.MessageKey,
        DataJson = insight.DataJson,
        Status = (int)insight.Status,
        CreatedAt = insight.CreatedAt,
        ResolvedAt = insight.ResolvedAt,
        ResolvedBy = insight.ResolvedBy
    };
}
