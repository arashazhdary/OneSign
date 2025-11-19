using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Repositories;

public class LoginHookRepository : ILoginHookRepository
{
    private readonly DbContext _dbContext;

    public LoginHookRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<LoginHook?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LoginHookEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<LoginHook>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LoginHookEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<LoginHook>> GetByTenantAndStageAsync(Guid tenantId, HookStage stage, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LoginHookEntity>()
            .Where(x => x.TenantId == tenantId && x.Stage == (int)stage)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<LoginHook>> GetEnabledByStageAsync(Guid tenantId, HookStage stage, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LoginHookEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled && x.Stage == (int)stage)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(LoginHook hook, CancellationToken ct = default)
    {
        var entity = MapToEntity(hook);
        await _dbContext.Set<LoginHookEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LoginHook hook, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LoginHookEntity>()
            .FirstOrDefaultAsync(x => x.Id == hook.Id, ct);
        if (entity != null)
        {
            entity.Name = hook.Name;
            entity.Stage = (int)hook.Stage;
            entity.EndpointUrl = hook.EndpointUrl;
            entity.Secret = hook.Secret;
            entity.TimeoutSeconds = hook.TimeoutSeconds;
            entity.FailOpen = hook.FailOpen;
            entity.IsEnabled = hook.IsEnabled;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LoginHookEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<LoginHookEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static LoginHook MapToDomain(LoginHookEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Name = entity.Name,
        Stage = (HookStage)entity.Stage,
        EndpointUrl = entity.EndpointUrl,
        Secret = entity.Secret,
        TimeoutSeconds = entity.TimeoutSeconds,
        FailOpen = entity.FailOpen,
        IsEnabled = entity.IsEnabled,
        CreatedAt = entity.CreatedAt
    };

    private static LoginHookEntity MapToEntity(LoginHook hook) => new()
    {
        Id = hook.Id,
        TenantId = hook.TenantId,
        Name = hook.Name,
        Stage = (int)hook.Stage,
        EndpointUrl = hook.EndpointUrl,
        Secret = hook.Secret,
        TimeoutSeconds = hook.TimeoutSeconds,
        FailOpen = hook.FailOpen,
        IsEnabled = hook.IsEnabled,
        CreatedAt = hook.CreatedAt
    };
}
