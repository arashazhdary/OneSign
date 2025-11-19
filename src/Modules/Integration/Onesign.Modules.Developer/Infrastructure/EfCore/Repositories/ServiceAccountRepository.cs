using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Repositories;

public class ServiceAccountRepository : IServiceAccountRepository
{
    private readonly OnesignDbContext _dbContext;

    public ServiceAccountRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ServiceAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ServiceAccountEntity>()
            .Include(x => x.ApiKeys)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<ServiceAccount?> GetByEmailAsync(Guid tenantId, string email, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ServiceAccountEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Email == email, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<ServiceAccount>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ServiceAccountEntity>()
            .Include(x => x.ApiKeys)
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<ServiceAccount> AddAsync(ServiceAccount serviceAccount, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(serviceAccount);
        _dbContext.Set<ServiceAccountEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(ServiceAccount serviceAccount, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ServiceAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == serviceAccount.Id, cancellationToken);

        if (entity != null)
        {
            entity.Name = serviceAccount.Name;
            entity.Description = serviceAccount.Description;
            entity.Email = serviceAccount.Email;
            entity.Status = serviceAccount.Status;
            entity.RolesJson = JsonSerializer.Serialize(serviceAccount.Roles);
            entity.LastAccessAt = serviceAccount.LastAccessAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ServiceAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<ServiceAccountEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task UpdateLastAccessAsync(Guid id, DateTime lastAccessAt, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ServiceAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            entity.LastAccessAt = lastAccessAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ServiceAccount MapToDomain(ServiceAccountEntity entity)
    {
        return new ServiceAccount
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Name = entity.Name,
            Description = entity.Description,
            Email = entity.Email,
            Status = entity.Status,
            Roles = JsonSerializer.Deserialize<List<string>>(entity.RolesJson) ?? new List<string>(),
            CreatedAt = entity.CreatedAt,
            LastAccessAt = entity.LastAccessAt,
            CreatedByUserId = entity.CreatedByUserId
        };
    }

    private static ServiceAccountEntity MapToEntity(ServiceAccount serviceAccount)
    {
        return new ServiceAccountEntity
        {
            Id = serviceAccount.Id,
            TenantId = serviceAccount.TenantId,
            Name = serviceAccount.Name,
            Description = serviceAccount.Description,
            Email = serviceAccount.Email,
            Status = serviceAccount.Status,
            RolesJson = JsonSerializer.Serialize(serviceAccount.Roles),
            CreatedAt = serviceAccount.CreatedAt,
            LastAccessAt = serviceAccount.LastAccessAt,
            CreatedByUserId = serviceAccount.CreatedByUserId
        };
    }
}
