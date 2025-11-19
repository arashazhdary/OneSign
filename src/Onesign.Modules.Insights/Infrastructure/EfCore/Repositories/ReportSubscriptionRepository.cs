using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;

public class ReportSubscriptionRepository : IReportSubscriptionRepository
{
    private readonly DbContext _dbContext;

    public ReportSubscriptionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ReportSubscription?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ReportSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<ReportSubscription>> GetByScopeAsync(ScopeType scopeType, Guid? scopeId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ReportSubscriptionEntity>()
            .Where(x => x.ScopeType == (int)scopeType && x.ScopeId == scopeId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ReportSubscription>> GetActiveSubscriptionsAsync(CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ReportSubscriptionEntity>()
            .Where(x => x.IsActive)
            .OrderBy(x => x.CronOrFrequency)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ReportSubscription>> GetByReportTypeAsync(ReportType reportType, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ReportSubscriptionEntity>()
            .Where(x => x.ReportType == (int)reportType)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ReportSubscription>> GetByCreatedByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ReportSubscriptionEntity>()
            .Where(x => x.CreatedByUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(ReportSubscription subscription, CancellationToken ct = default)
    {
        var entity = MapToEntity(subscription);
        await _dbContext.Set<ReportSubscriptionEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ReportSubscription subscription, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ReportSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == subscription.Id, ct);
        if (entity != null)
        {
            entity.ScopeType = (int)subscription.ScopeType;
            entity.ScopeId = subscription.ScopeId;
            entity.ReportType = (int)subscription.ReportType;
            entity.CronOrFrequency = subscription.CronOrFrequency;
            entity.EmailRecipients = subscription.EmailRecipients;
            entity.IsActive = subscription.IsActive;
            entity.UpdatedAt = subscription.UpdatedAt;
            entity.UpdatedByUserId = subscription.UpdatedByUserId;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ReportSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<ReportSubscriptionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static ReportSubscription MapToDomain(ReportSubscriptionEntity entity) => new()
    {
        Id = entity.Id,
        ScopeType = (ScopeType)entity.ScopeType,
        ScopeId = entity.ScopeId,
        ReportType = (ReportType)entity.ReportType,
        CronOrFrequency = entity.CronOrFrequency,
        EmailRecipients = entity.EmailRecipients,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt,
        CreatedByUserId = entity.CreatedByUserId,
        UpdatedAt = entity.UpdatedAt,
        UpdatedByUserId = entity.UpdatedByUserId
    };

    private static ReportSubscriptionEntity MapToEntity(ReportSubscription subscription) => new()
    {
        Id = subscription.Id,
        ScopeType = (int)subscription.ScopeType,
        ScopeId = subscription.ScopeId,
        ReportType = (int)subscription.ReportType,
        CronOrFrequency = subscription.CronOrFrequency,
        EmailRecipients = subscription.EmailRecipients,
        IsActive = subscription.IsActive,
        CreatedAt = subscription.CreatedAt,
        CreatedByUserId = subscription.CreatedByUserId,
        UpdatedAt = subscription.UpdatedAt,
        UpdatedByUserId = subscription.UpdatedByUserId
    };
}
