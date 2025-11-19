using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Repositories;

public class HuntRunRepository : IHuntRunRepository
{
    private readonly OnesignDbContext _dbContext;

    public HuntRunRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HuntRun?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<HuntRun?> GetByIdWithSampleRowsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .Include(x => x.SampleRows)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithSampleRows(entity) : null;
    }

    public async Task<IReadOnlyList<HuntRun>> GetByScheduledHuntIdAsync(Guid scheduledHuntId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<HuntRunEntity>()
            .Where(x => x.ScheduledHuntId == scheduledHuntId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<HuntRun>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<HuntRun>> GetByStatusAsync(HuntRunStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .Where(x => x.Status == (int)status)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<HuntRun?> GetLatestByScheduledHuntIdAsync(Guid scheduledHuntId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .Where(x => x.ScheduledHuntId == scheduledHuntId)
            .OrderByDescending(x => x.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<(IReadOnlyList<HuntRun> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        Guid? scheduledHuntId,
        HuntRunStatus? status,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<HuntRunEntity>()
            .Include(x => x.ScheduledHunt)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId);

        if (scheduledHuntId.HasValue)
            query = query.Where(x => x.ScheduledHuntId == scheduledHuntId.Value);

        if (status.HasValue)
            query = query.Where(x => x.Status == (int)status.Value);

        if (fromDate.HasValue)
            query = query.Where(x => x.StartedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.StartedAt <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (entities.Select(MapToDomain).ToList(), totalCount);
    }

    public async Task AddAsync(HuntRun huntRun, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(huntRun);
        await _dbContext.Set<HuntRunEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(HuntRun huntRun, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<HuntRunEntity>()
            .Include(x => x.SampleRows)
            .FirstOrDefaultAsync(x => x.Id == huntRun.Id, cancellationToken);

        if (existing == null)
            return;

        existing.CompletedAt = huntRun.CompletedAt;
        existing.Status = (int)huntRun.Status;
        existing.MatchCount = huntRun.MatchCount;
        existing.FindingCreated = huntRun.FindingCreated;
        existing.IncidentId = huntRun.IncidentId;
        existing.TriggeredWorkflowId = huntRun.TriggeredWorkflowId;
        existing.ErrorMessage = huntRun.ErrorMessage;

        // Update sample rows
        _dbContext.Set<HuntSampleRowEntity>().RemoveRange(existing.SampleRows);
        foreach (var row in huntRun.SampleRows)
        {
            existing.SampleRows.Add(new HuntSampleRowEntity
            {
                Id = row.Id,
                HuntRunId = huntRun.Id,
                RowIndex = row.RowIndex,
                Dataset = (int)row.Dataset,
                DocumentJson = row.DocumentJson
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<HuntRunEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<HuntRunEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static HuntRun MapToDomain(HuntRunEntity e)
    {
        var run = new HuntRun
        {
            Id = e.Id,
            ScheduledHuntId = e.ScheduledHuntId,
            ScopeType = e.ScopeType,
            ScopeId = e.ScopeId,
            StartedAt = e.StartedAt,
            CompletedAt = e.CompletedAt,
            Status = (HuntRunStatus)e.Status,
            MatchCount = e.MatchCount,
            FindingCreated = e.FindingCreated,
            IncidentId = e.IncidentId,
            TriggeredWorkflowId = e.TriggeredWorkflowId,
            ErrorMessage = e.ErrorMessage
        };

        if (e.ScheduledHunt != null)
        {
            run.ScheduledHunt = new ScheduledHunt
            {
                Id = e.ScheduledHunt.Id,
                ScopeType = e.ScheduledHunt.ScopeType,
                ScopeId = e.ScheduledHunt.ScopeId,
                SavedQueryId = e.ScheduledHunt.SavedQueryId,
                Name = e.ScheduledHunt.Name,
                Description = e.ScheduledHunt.Description,
                ScheduleSpec = (HuntScheduleSpec)e.ScheduledHunt.ScheduleSpec,
                IsEnabled = e.ScheduledHunt.IsEnabled,
                MinMatchCountForFinding = e.ScheduledHunt.MinMatchCountForFinding,
                MaxRowsToScan = e.ScheduledHunt.MaxRowsToScan,
                TimeWindowMinutes = e.ScheduledHunt.TimeWindowMinutes,
                ActionsJson = e.ScheduledHunt.ActionsJson,
                CreatedByUserId = e.ScheduledHunt.CreatedByUserId,
                CreatedAt = e.ScheduledHunt.CreatedAt,
                UpdatedByUserId = e.ScheduledHunt.UpdatedByUserId,
                UpdatedAt = e.ScheduledHunt.UpdatedAt
            };
        }

        return run;
    }

    private static HuntRun MapToDomainWithSampleRows(HuntRunEntity e)
    {
        var run = MapToDomain(e);

        run.SampleRows = e.SampleRows.OrderBy(r => r.RowIndex).Select(r => new HuntSampleRow
        {
            Id = r.Id,
            HuntRunId = r.HuntRunId,
            RowIndex = r.RowIndex,
            Dataset = (HuntDataset)r.Dataset,
            DocumentJson = r.DocumentJson
        }).ToList();

        return run;
    }

    private static HuntRunEntity MapToEntity(HuntRun d)
    {
        var entity = new HuntRunEntity
        {
            Id = d.Id,
            ScheduledHuntId = d.ScheduledHuntId,
            ScopeType = d.ScopeType,
            ScopeId = d.ScopeId,
            StartedAt = d.StartedAt,
            CompletedAt = d.CompletedAt,
            Status = (int)d.Status,
            MatchCount = d.MatchCount,
            FindingCreated = d.FindingCreated,
            IncidentId = d.IncidentId,
            TriggeredWorkflowId = d.TriggeredWorkflowId,
            ErrorMessage = d.ErrorMessage
        };

        foreach (var row in d.SampleRows)
        {
            entity.SampleRows.Add(new HuntSampleRowEntity
            {
                Id = row.Id,
                HuntRunId = d.Id,
                RowIndex = row.RowIndex,
                Dataset = (int)row.Dataset,
                DocumentJson = row.DocumentJson
            });
        }

        return entity;
    }
}
