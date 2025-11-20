using Microsoft.EntityFrameworkCore;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

public class NotificationChannelConfigRepository : INotificationChannelConfigRepository
{
    private readonly DbContext _context;
    private readonly DbSet<NotificationChannelConfigEntity> _dbSet;

    public NotificationChannelConfigRepository(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<NotificationChannelConfigEntity>();
    }

    public async Task<NotificationChannelConfig?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<NotificationChannelConfig?> GetByChannelAsync(Guid tenantId, NotificationChannel channel, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Channel == (int)channel, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<NotificationChannelConfig>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbSet.Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(NotificationChannelConfig config, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(config);
        await _dbSet.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationChannelConfig config, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(x => x.Id == config.Id, cancellationToken);
        if (entity != null)
        {
            entity.IsEnabled = config.IsEnabled;
            entity.ConfigurationJson = config.ConfigurationJson;
            entity.UpdatedAt = config.UpdatedAt;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private static NotificationChannelConfig MapToDomain(NotificationChannelConfigEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Channel = (NotificationChannel)entity.Channel,
        IsEnabled = entity.IsEnabled,
        ConfigurationJson = entity.ConfigurationJson,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static NotificationChannelConfigEntity MapToEntity(NotificationChannelConfig domain) => new()
    {
        Id = domain.Id,
        TenantId = domain.TenantId,
        Channel = (int)domain.Channel,
        IsEnabled = domain.IsEnabled,
        ConfigurationJson = domain.ConfigurationJson,
        CreatedAt = domain.CreatedAt,
        UpdatedAt = domain.UpdatedAt
    };
}
