using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class TenantUserRepository : ITenantUserRepository
{
    private readonly DbContext _dbContext;

    public TenantUserRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<TenantUser?> GetByGlobalUserIdAndTenantIdAsync(Guid globalUserId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(x => x.GlobalUserId == globalUserId && x.TenantId == tenantId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<TenantUser>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantUserEntity>()
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<TenantUser> AddAsync(TenantUser user, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(user);
        await _dbContext.Set<TenantUserEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(TenantUser user, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == user.Id, cancellationToken);
        if (entity != null)
        {
            entity.Status = user.Status;
            entity.IsAdmin = user.IsAdmin;
            entity.FirstLoginAt = user.FirstLoginAt;
            entity.LastLoginAt = user.LastLoginAt;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static TenantUser MapToDomain(TenantUserEntity entity) => new()
    {
        Id = entity.Id,
        GlobalUserId = entity.GlobalUserId,
        TenantId = entity.TenantId,
        Status = entity.Status,
        IsAdmin = entity.IsAdmin,
        FirstLoginAt = entity.FirstLoginAt,
        LastLoginAt = entity.LastLoginAt,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static TenantUserEntity MapToEntity(TenantUser user) => new()
    {
        Id = user.Id,
        GlobalUserId = user.GlobalUserId,
        TenantId = user.TenantId,
        Status = user.Status,
        IsAdmin = user.IsAdmin,
        FirstLoginAt = user.FirstLoginAt,
        LastLoginAt = user.LastLoginAt,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt
    };
}

