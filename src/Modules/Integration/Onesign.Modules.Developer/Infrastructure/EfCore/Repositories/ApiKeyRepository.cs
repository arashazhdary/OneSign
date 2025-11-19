using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Repositories;

public class ApiKeyRepository : IApiKeyRepository
{
    private readonly OnesignDbContext _dbContext;

    public ApiKeyRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApiKey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApiKeyEntity>()
            .Include(x => x.ServiceAccount)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<ApiKey?> GetByKeyHashAsync(string keyHash, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApiKeyEntity>()
            .Include(x => x.ServiceAccount)
            .FirstOrDefaultAsync(x => x.KeyHash == keyHash, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<ApiKey>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApiKeyEntity>()
            .Include(x => x.ServiceAccount)
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<List<ApiKey>> GetByServiceAccountIdAsync(Guid serviceAccountId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApiKeyEntity>()
            .Where(x => x.ServiceAccountId == serviceAccountId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<ApiKey> AddAsync(ApiKey apiKey, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(apiKey);
        _dbContext.Set<ApiKeyEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(ApiKey apiKey, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApiKeyEntity>()
            .FirstOrDefaultAsync(x => x.Id == apiKey.Id, cancellationToken);

        if (entity != null)
        {
            entity.Name = apiKey.Name;
            entity.Description = apiKey.Description;
            entity.Status = apiKey.Status;
            entity.ScopesJson = JsonSerializer.Serialize(apiKey.Scopes);
            entity.LastUsedAt = apiKey.LastUsedAt;
            entity.RevokedAt = apiKey.RevokedAt;
            entity.RevokedReason = apiKey.RevokedReason;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApiKeyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<ApiKeyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task UpdateLastUsedAsync(Guid id, DateTime lastUsedAt, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApiKeyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            entity.LastUsedAt = lastUsedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ApiKey MapToDomain(ApiKeyEntity entity)
    {
        return new ApiKey
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            ServiceAccountId = entity.ServiceAccountId,
            Name = entity.Name,
            Description = entity.Description,
            KeyHash = entity.KeyHash,
            KeyPrefix = entity.KeyPrefix,
            Status = entity.Status,
            Scopes = JsonSerializer.Deserialize<List<string>>(entity.ScopesJson) ?? new List<string>(),
            CreatedAt = entity.CreatedAt,
            ExpiresAt = entity.ExpiresAt,
            LastUsedAt = entity.LastUsedAt,
            RevokedAt = entity.RevokedAt,
            RevokedReason = entity.RevokedReason
        };
    }

    private static ApiKeyEntity MapToEntity(ApiKey apiKey)
    {
        return new ApiKeyEntity
        {
            Id = apiKey.Id,
            TenantId = apiKey.TenantId,
            ServiceAccountId = apiKey.ServiceAccountId,
            Name = apiKey.Name,
            Description = apiKey.Description,
            KeyHash = apiKey.KeyHash,
            KeyPrefix = apiKey.KeyPrefix,
            Status = apiKey.Status,
            ScopesJson = JsonSerializer.Serialize(apiKey.Scopes),
            CreatedAt = apiKey.CreatedAt,
            ExpiresAt = apiKey.ExpiresAt,
            LastUsedAt = apiKey.LastUsedAt,
            RevokedAt = apiKey.RevokedAt,
            RevokedReason = apiKey.RevokedReason
        };
    }
}
