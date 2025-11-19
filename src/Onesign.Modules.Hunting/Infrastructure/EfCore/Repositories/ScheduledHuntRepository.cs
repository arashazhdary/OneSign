using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Repositories;

public class ScheduledHuntRepository : IScheduledHuntRepository
{
    private readonly OnesignDbContext _dbContext;

    public ScheduledHuntRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ScheduledHunt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<ScheduledHunt?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Include(x => x.HuntRuns)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithDetails(entity) : null;
    }

    public async Task<IReadOnlyList<ScheduledHunt>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ScheduledHunt>> GetBySavedQueryIdAsync(Guid savedQueryId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Where(x => x.SavedQueryId == savedQueryId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ScheduledHunt>> GetEnabledByScheduleSpecAsync(HuntScheduleSpec scheduleSpec, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Where(x => x.IsEnabled && x.ScheduleSpec == (int)scheduleSpec)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ScheduledHunt>> GetAllEnabledAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Where(x => x.IsEnabled)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<(IReadOnlyList<ScheduledHunt> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        HuntScheduleSpec? scheduleSpec,
        bool? isEnabled,
        Guid? savedQueryId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<ScheduledHuntEntity>()
            .Include(x => x.SavedQuery)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId);

        if (scheduleSpec.HasValue)
            query = query.Where(x => x.ScheduleSpec == (int)scheduleSpec.Value);

        if (isEnabled.HasValue)
            query = query.Where(x => x.IsEnabled == isEnabled.Value);

        if (savedQueryId.HasValue)
            query = query.Where(x => x.SavedQueryId == savedQueryId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (entities.Select(MapToDomain).ToList(), totalCount);
    }

    public async Task AddAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(scheduledHunt);
        await _dbContext.Set<ScheduledHuntEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<ScheduledHuntEntity>()
            .FirstOrDefaultAsync(x => x.Id == scheduledHunt.Id, cancellationToken);

        if (existing == null)
            return;

        existing.Name = scheduledHunt.Name;
        existing.Description = scheduledHunt.Description;
        existing.SavedQueryId = scheduledHunt.SavedQueryId;
        existing.ScheduleSpec = (int)scheduledHunt.ScheduleSpec;
        existing.IsEnabled = scheduledHunt.IsEnabled;
        existing.MinMatchCountForFinding = scheduledHunt.MinMatchCountForFinding;
        existing.MaxRowsToScan = scheduledHunt.MaxRowsToScan;
        existing.TimeWindowMinutes = scheduledHunt.TimeWindowMinutes;
        existing.ActionsJson = scheduledHunt.ActionsJson;
        existing.UpdatedByUserId = scheduledHunt.UpdatedByUserId;
        existing.UpdatedAt = scheduledHunt.UpdatedAt;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScheduledHuntEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<ScheduledHuntEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ScheduledHunt MapToDomain(ScheduledHuntEntity e)
    {
        var hunt = new ScheduledHunt
        {
            Id = e.Id,
            ScopeType = e.ScopeType,
            ScopeId = e.ScopeId,
            SavedQueryId = e.SavedQueryId,
            Name = e.Name,
            Description = e.Description,
            ScheduleSpec = (HuntScheduleSpec)e.ScheduleSpec,
            IsEnabled = e.IsEnabled,
            MinMatchCountForFinding = e.MinMatchCountForFinding,
            MaxRowsToScan = e.MaxRowsToScan,
            TimeWindowMinutes = e.TimeWindowMinutes,
            ActionsJson = e.ActionsJson,
            CreatedByUserId = e.CreatedByUserId,
            CreatedAt = e.CreatedAt,
            UpdatedByUserId = e.UpdatedByUserId,
            UpdatedAt = e.UpdatedAt
        };

        if (e.SavedQuery != null)
        {
            hunt.SavedQuery = new SavedQuery
            {
                Id = e.SavedQuery.Id,
                ScopeType = e.SavedQuery.ScopeType,
                ScopeId = e.SavedQuery.ScopeId,
                Name = e.SavedQuery.Name,
                Description = e.SavedQuery.Description,
                Dataset = (HuntDataset)e.SavedQuery.Dataset,
                QueryDslJson = e.SavedQuery.QueryDslJson,
                IsGlobalTemplate = e.SavedQuery.IsGlobalTemplate,
                IsEnabled = e.SavedQuery.IsEnabled,
                CreatedByUserId = e.SavedQuery.CreatedByUserId,
                CreatedAt = e.SavedQuery.CreatedAt,
                UpdatedByUserId = e.SavedQuery.UpdatedByUserId,
                UpdatedAt = e.SavedQuery.UpdatedAt
            };
        }

        return hunt;
    }

    private static ScheduledHunt MapToDomainWithDetails(ScheduledHuntEntity e)
    {
        var hunt = MapToDomain(e);

        hunt.HuntRuns = e.HuntRuns.OrderByDescending(r => r.StartedAt).Select(r => new HuntRun
        {
            Id = r.Id,
            ScheduledHuntId = r.ScheduledHuntId,
            ScopeType = r.ScopeType,
            ScopeId = r.ScopeId,
            StartedAt = r.StartedAt,
            CompletedAt = r.CompletedAt,
            Status = (HuntRunStatus)r.Status,
            MatchCount = r.MatchCount,
            FindingCreated = r.FindingCreated,
            IncidentId = r.IncidentId,
            TriggeredWorkflowId = r.TriggeredWorkflowId,
            ErrorMessage = r.ErrorMessage
        }).ToList();

        return hunt;
    }

    private static ScheduledHuntEntity MapToEntity(ScheduledHunt d) => new()
    {
        Id = d.Id,
        ScopeType = d.ScopeType,
        ScopeId = d.ScopeId,
        SavedQueryId = d.SavedQueryId,
        Name = d.Name,
        Description = d.Description,
        ScheduleSpec = (int)d.ScheduleSpec,
        IsEnabled = d.IsEnabled,
        MinMatchCountForFinding = d.MinMatchCountForFinding,
        MaxRowsToScan = d.MaxRowsToScan,
        TimeWindowMinutes = d.TimeWindowMinutes,
        ActionsJson = d.ActionsJson,
        CreatedByUserId = d.CreatedByUserId,
        CreatedAt = d.CreatedAt,
        UpdatedByUserId = d.UpdatedByUserId,
        UpdatedAt = d.UpdatedAt
    };
}
