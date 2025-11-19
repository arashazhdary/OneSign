using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Repositories;

public class SavedQueryRepository : ISavedQueryRepository
{
    private readonly OnesignDbContext _dbContext;

    public SavedQueryRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SavedQuery?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SavedQueryEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<SavedQuery?> GetByIdWithScheduledHuntsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SavedQueryEntity>()
            .Include(x => x.ScheduledHunts)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithScheduledHunts(entity) : null;
    }

    public async Task<IReadOnlyList<SavedQuery>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<SavedQueryEntity>()
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SavedQuery>> GetByDatasetAsync(string scopeType, Guid scopeId, HuntDataset dataset, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<SavedQueryEntity>()
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId && x.Dataset == (int)dataset)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<SavedQuery>> GetGlobalTemplatesAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<SavedQueryEntity>()
            .Where(x => x.IsGlobalTemplate)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<(IReadOnlyList<SavedQuery> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        HuntDataset? dataset,
        bool? isEnabled,
        string? searchTerm,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<SavedQueryEntity>()
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId);

        if (dataset.HasValue)
            query = query.Where(x => x.Dataset == (int)dataset.Value);

        if (isEnabled.HasValue)
            query = query.Where(x => x.IsEnabled == isEnabled.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(x => x.Name.Contains(searchTerm) || (x.Description != null && x.Description.Contains(searchTerm)));

        var totalCount = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (entities.Select(MapToDomain).ToList(), totalCount);
    }

    public async Task AddAsync(SavedQuery savedQuery, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(savedQuery);
        await _dbContext.Set<SavedQueryEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(SavedQuery savedQuery, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<SavedQueryEntity>()
            .FirstOrDefaultAsync(x => x.Id == savedQuery.Id, cancellationToken);

        if (existing == null)
            return;

        existing.Name = savedQuery.Name;
        existing.Description = savedQuery.Description;
        existing.Dataset = (int)savedQuery.Dataset;
        existing.QueryDslJson = savedQuery.QueryDslJson;
        existing.IsGlobalTemplate = savedQuery.IsGlobalTemplate;
        existing.IsEnabled = savedQuery.IsEnabled;
        existing.UpdatedByUserId = savedQuery.UpdatedByUserId;
        existing.UpdatedAt = savedQuery.UpdatedAt;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SavedQueryEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<SavedQueryEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static SavedQuery MapToDomain(SavedQueryEntity e) => new()
    {
        Id = e.Id,
        ScopeType = e.ScopeType,
        ScopeId = e.ScopeId,
        Name = e.Name,
        Description = e.Description,
        Dataset = (HuntDataset)e.Dataset,
        QueryDslJson = e.QueryDslJson,
        IsGlobalTemplate = e.IsGlobalTemplate,
        IsEnabled = e.IsEnabled,
        CreatedByUserId = e.CreatedByUserId,
        CreatedAt = e.CreatedAt,
        UpdatedByUserId = e.UpdatedByUserId,
        UpdatedAt = e.UpdatedAt
    };

    private static SavedQuery MapToDomainWithScheduledHunts(SavedQueryEntity e)
    {
        var savedQuery = MapToDomain(e);

        savedQuery.ScheduledHunts = e.ScheduledHunts.Select(h => new ScheduledHunt
        {
            Id = h.Id,
            ScopeType = h.ScopeType,
            ScopeId = h.ScopeId,
            SavedQueryId = h.SavedQueryId,
            Name = h.Name,
            Description = h.Description,
            ScheduleSpec = (HuntScheduleSpec)h.ScheduleSpec,
            IsEnabled = h.IsEnabled,
            MinMatchCountForFinding = h.MinMatchCountForFinding,
            MaxRowsToScan = h.MaxRowsToScan,
            TimeWindowMinutes = h.TimeWindowMinutes,
            ActionsJson = h.ActionsJson,
            CreatedByUserId = h.CreatedByUserId,
            CreatedAt = h.CreatedAt,
            UpdatedByUserId = h.UpdatedByUserId,
            UpdatedAt = h.UpdatedAt
        }).ToList();

        return savedQuery;
    }

    private static SavedQueryEntity MapToEntity(SavedQuery d) => new()
    {
        Id = d.Id,
        ScopeType = d.ScopeType,
        ScopeId = d.ScopeId,
        Name = d.Name,
        Description = d.Description,
        Dataset = (int)d.Dataset,
        QueryDslJson = d.QueryDslJson,
        IsGlobalTemplate = d.IsGlobalTemplate,
        IsEnabled = d.IsEnabled,
        CreatedByUserId = d.CreatedByUserId,
        CreatedAt = d.CreatedAt,
        UpdatedByUserId = d.UpdatedByUserId,
        UpdatedAt = d.UpdatedAt
    };
}
