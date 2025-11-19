using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class UserMfaMethodRepository : IUserMfaMethodRepository
{
    private readonly DbContext _dbContext;

    public UserMfaMethodRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserMfaMethod?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserMfaMethodEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<UserMfaMethod>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserMfaMethodEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<UserMfaMethod>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await GetByTenantUserIdAsync(userId, cancellationToken);
    }

    public async Task<UserMfaMethod?> GetPrimaryByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserMfaMethodEntity>()
            .FirstOrDefaultAsync(x => x.TenantUserId == tenantUserId && x.IsPrimary, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task AddAsync(UserMfaMethod userMfaMethod, CancellationToken cancellationToken = default)
    {
        var entity = UserMfaMethodEntity.FromDomain(userMfaMethod);
        await _dbContext.Set<UserMfaMethodEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UserMfaMethod userMfaMethod, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserMfaMethodEntity>()
            .FirstOrDefaultAsync(x => x.Id == userMfaMethod.Id, cancellationToken);

        if (entity != null)
        {
            entity.TenantUserId = userMfaMethod.TenantUserId;
            entity.MethodType = userMfaMethod.MethodType;
            entity.IsPrimary = userMfaMethod.IsPrimary;
            entity.IsVerified = userMfaMethod.IsVerified;
            entity.SecretEncrypted = userMfaMethod.SecretEncrypted;
            entity.UpdatedAt = userMfaMethod.UpdatedAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserMfaMethodEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<UserMfaMethodEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
