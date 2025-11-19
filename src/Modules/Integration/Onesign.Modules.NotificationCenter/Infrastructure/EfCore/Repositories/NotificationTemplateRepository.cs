using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

public class NotificationTemplateRepository : INotificationTemplateRepository
{
    private readonly OnesignDbContext _dbContext;

    public NotificationTemplateRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationTemplateEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<NotificationTemplate?> GetByKeyAsync(Guid tenantId, string templateKey, NotificationChannel channel, string locale, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationTemplateEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.TemplateKey == templateKey && x.Channel == (int)channel && x.Locale == locale, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<NotificationTemplate>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<NotificationTemplateEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Channel)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(NotificationTemplate template, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(template);
        await _dbContext.Set<NotificationTemplateEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationTemplate template, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(template);
        _dbContext.Set<NotificationTemplateEntity>().Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationTemplateEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<NotificationTemplateEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static NotificationTemplate MapToDomain(NotificationTemplateEntity e) => new()
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

    private static NotificationTemplateEntity MapToEntity(NotificationTemplate d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        TemplateKey = d.TemplateKey,
        Name = d.Name,
        Category = (int)d.Category,
        Channel = (int)d.Channel,
        Locale = d.Locale,
        SubjectTemplate = d.SubjectTemplate,
        BodyTemplate = d.BodyTemplate,
        IsEnabled = d.IsEnabled,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
