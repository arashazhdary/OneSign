using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Repositories;

public class BreakGlassAccountRepository : IBreakGlassAccountRepository
{
    private readonly OnesignDbContext _dbContext;

    public BreakGlassAccountRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BreakGlassAccount?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<BreakGlassAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<BreakGlassAccount?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<BreakGlassAccountEntity>()
            .FirstOrDefaultAsync(x => x.Username == username, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<BreakGlassAccount>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<BreakGlassAccountEntity>()
            .OrderBy(x => x.Username)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<BreakGlassAccount>> GetEnabledAsync(CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<BreakGlassAccountEntity>()
            .Where(x => x.IsEnabled)
            .OrderBy(x => x.Username)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(BreakGlassAccount account, CancellationToken ct = default)
    {
        var entity = MapToEntity(account);
        await _dbContext.Set<BreakGlassAccountEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(BreakGlassAccount account, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<BreakGlassAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == account.Id, ct);

        if (entity != null)
        {
            entity.Username = account.Username;
            entity.PasswordHash = account.PasswordHash;
            entity.IsEnabled = account.IsEnabled;
            entity.AllowedTenantsJson = account.AllowedTenantsJson;
            entity.AllowedRolesJson = account.AllowedRolesJson;
            entity.LastUsedAt = account.LastUsedAt;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<BreakGlassAccountEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity != null)
        {
            _dbContext.Set<BreakGlassAccountEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static BreakGlassAccount MapToDomain(BreakGlassAccountEntity e) => new()
    {
        Id = e.Id,
        Username = e.Username,
        PasswordHash = e.PasswordHash,
        IsEnabled = e.IsEnabled,
        AllowedTenantsJson = e.AllowedTenantsJson,
        AllowedRolesJson = e.AllowedRolesJson,
        LastUsedAt = e.LastUsedAt,
        CreatedAt = e.CreatedAt
    };

    private static BreakGlassAccountEntity MapToEntity(BreakGlassAccount d) => new()
    {
        Id = d.Id,
        Username = d.Username,
        PasswordHash = d.PasswordHash,
        IsEnabled = d.IsEnabled,
        AllowedTenantsJson = d.AllowedTenantsJson,
        AllowedRolesJson = d.AllowedRolesJson,
        LastUsedAt = d.LastUsedAt,
        CreatedAt = d.CreatedAt
    };
}
