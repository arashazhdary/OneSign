using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Repositories;

public class IncidentRepository : IIncidentRepository
{
    private readonly DbContext _dbContext;

    public IncidentRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Incident?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<Incident>> GetByTenantAsync(Guid tenantId, int skip, int take, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.DetectedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetByStatusAsync(Guid tenantId, IncidentStatus status, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.Status == (int)status)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetBySeverityAsync(Guid tenantId, IncidentSeverity severity, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.Severity == (int)severity)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetByCategoryAsync(Guid tenantId, IncidentCategory category, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.Category == (int)category)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.PrimaryUserId == userId)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetByApplicationAsync(Guid tenantId, Guid appId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.PrimaryAppId == appId)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetByDateRangeAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && x.DetectedAt >= from && x.DetectedAt <= to)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Incident>> GetActiveIncidentsAsync(Guid tenantId, CancellationToken ct = default)
    {
        var closedStatuses = new[] { (int)IncidentStatus.Resolved, (int)IncidentStatus.Closed };
        var entities = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .Where(x => x.TenantId == tenantId && !closedStatuses.Contains(x.Status))
            .OrderByDescending(x => x.Severity)
            .ThenByDescending(x => x.DetectedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetCountByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .CountAsync(x => x.TenantId == tenantId, ct);
    }

    public async Task<int> GetCountByStatusAsync(Guid tenantId, IncidentStatus status, CancellationToken ct = default)
    {
        return await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .CountAsync(x => x.TenantId == tenantId && x.Status == (int)status, ct);
    }

    public async Task AddAsync(Incident incident, CancellationToken ct = default)
    {
        var entity = MapToEntity(incident);
        await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Incident incident, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .FirstOrDefaultAsync(x => x.Id == incident.Id, ct);
        if (entity != null)
        {
            entity.Title = incident.Title;
            entity.Description = incident.Description;
            entity.Category = (int)incident.Category;
            entity.Severity = (int)incident.Severity;
            entity.Status = (int)incident.Status;
            entity.DetectionSource = (int)incident.DetectionSource;
            entity.PrimaryUserId = incident.PrimaryUserId;
            entity.PrimaryAppId = incident.PrimaryAppId;
            entity.AffectedUsersCount = incident.AffectedUsersCount;
            entity.AffectedAppsCount = incident.AffectedAppsCount;
            entity.AcknowledgedAt = incident.AcknowledgedAt;
            entity.AcknowledgedByUserId = incident.AcknowledgedByUserId;
            entity.ResolvedAt = incident.ResolvedAt;
            entity.ResolvedByUserId = incident.ResolvedByUserId;
            entity.ClosedAt = incident.ClosedAt;
            entity.ClosedByUserId = incident.ClosedByUserId;
            entity.ResolutionSummary = incident.ResolutionSummary;
            entity.UpdatedAt = incident.UpdatedAt;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<Infrastructure.EfCore.Entities.IncidentEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static Incident MapToDomain(Infrastructure.EfCore.Entities.IncidentEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Title = entity.Title,
        Description = entity.Description,
        Category = (IncidentCategory)entity.Category,
        Severity = (IncidentSeverity)entity.Severity,
        Status = (IncidentStatus)entity.Status,
        DetectionSource = (DetectionSource)entity.DetectionSource,
        PrimaryUserId = entity.PrimaryUserId,
        PrimaryAppId = entity.PrimaryAppId,
        AffectedUsersCount = entity.AffectedUsersCount,
        AffectedAppsCount = entity.AffectedAppsCount,
        DetectedAt = entity.DetectedAt,
        AcknowledgedAt = entity.AcknowledgedAt,
        AcknowledgedByUserId = entity.AcknowledgedByUserId,
        ResolvedAt = entity.ResolvedAt,
        ResolvedByUserId = entity.ResolvedByUserId,
        ClosedAt = entity.ClosedAt,
        ClosedByUserId = entity.ClosedByUserId,
        ResolutionSummary = entity.ResolutionSummary,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        AssignedTo = entity.AssignedTo,
        IsEscalated = entity.IsEscalated,
        EscalationReason = entity.EscalationReason,
        RootCause = entity.RootCause,
        ClosingNotes = entity.ClosingNotes
    };

    private static Infrastructure.EfCore.Entities.IncidentEntity MapToEntity(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = (int)incident.Category,
        Severity = (int)incident.Severity,
        Status = (int)incident.Status,
        DetectionSource = (int)incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt,
        AssignedTo = incident.AssignedTo,
        IsEscalated = incident.IsEscalated,
        EscalationReason = incident.EscalationReason,
        RootCause = incident.RootCause,
        ClosingNotes = incident.ClosingNotes
    };
}
