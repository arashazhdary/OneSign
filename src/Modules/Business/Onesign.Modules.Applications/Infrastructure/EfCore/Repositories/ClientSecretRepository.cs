using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;

public class ClientSecretRepository : IClientSecretRepository
{
    private readonly DbContext _dbContext;

    public ClientSecretRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ClientSecret?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ClientSecretEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        
        return entity?.ToDomain();
    }

    public async Task<List<ClientSecret>> GetByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ClientSecretEntity>()
            .Where(x => x.ApplicationClientId == applicationClientId)
            .ToListAsync(cancellationToken);
        
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<ClientSecret> AddAsync(ClientSecret clientSecret, CancellationToken cancellationToken = default)
    {
        var entity = ClientSecretEntity.FromDomain(clientSecret);
        await _dbContext.Set<ClientSecretEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ClientSecretEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        
        if (entity != null)
        {
            _dbContext.Set<ClientSecretEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteExpiredSecretsAsync(CancellationToken cancellationToken = default)
    {
        var expiredSecrets = await _dbContext.Set<ClientSecretEntity>()
            .Where(x => x.ExpiresAt.HasValue && x.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(cancellationToken);
        
        _dbContext.Set<ClientSecretEntity>().RemoveRange(expiredSecrets);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

