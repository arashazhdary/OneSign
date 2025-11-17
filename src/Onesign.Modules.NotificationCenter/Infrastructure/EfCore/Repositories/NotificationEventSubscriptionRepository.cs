using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

public class NotificationEventSubscriptionRepository : INotificationEventSubscriptionRepository
{
    private readonly OnesignDbContext _dbContext;

    public NotificationEventSubscriptionRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<NotificationEventSubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationEventSubscriptionEntity>()
            .Include(x => x.Template)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<NotificationEventSubscription>> GetByEventTypeAsync(Guid tenantId, string eventType, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<NotificationEventSubscriptionEntity>()
            .Include(x => x.Template)
            .Where(x => x.TenantId == tenantId && x.EventType == eventType && x.IsEnabled)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<NotificationEventSubscription>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<NotificationEventSubscriptionEntity>()
            .Include(x => x.Template)
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.EventType)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(NotificationEventSubscription subscription, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(subscription);
        await _dbContext.Set<NotificationEventSubscriptionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationEventSubscription subscription, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(subscription);
        _dbContext.Set<NotificationEventSubscriptionEntity>().Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationEventSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<NotificationEventSubscriptionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static NotificationEventSubscription MapToDomain(NotificationEventSubscriptionEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        EventType = e.EventType,
        Channel = (NotificationChannel)e.Channel,
        TemplateId = e.TemplateId,
        RecipientSelector = e.RecipientSelector,
        IsEnabled = e.IsEnabled,
        CreatedAt = e.CreatedAt,
        Template = e.Template != null ? MapTemplateToDomain(e.Template) : null
    };

    private static NotificationEventSubscriptionEntity MapToEntity(NotificationEventSubscription d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        EventType = d.EventType,
        Channel = (int)d.Channel,
        TemplateId = d.TemplateId,
        RecipientSelector = d.RecipientSelector,
        IsEnabled = d.IsEnabled,
        CreatedAt = d.CreatedAt
    };

    private static NotificationTemplate MapTemplateToDomain(NotificationTemplateEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        TemplateKey = e.TemplateKey,
        Name = e.Name,
        Category = (TemplateCategory)e.Category,
        Channel = (NotificationChannel)e.Channel,
        Locale = e.Locale,
        SubjectTemplate = e.SubjectTemplate,
        BodyTemplate = e.BodyTemplate,
        IsEnabled = e.IsEnabled,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };
}
