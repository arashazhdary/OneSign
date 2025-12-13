using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class PasskeyCredentialRepository : IPasskeyCredentialRepository
{
    private readonly DbContext _dbContext;

    public PasskeyCredentialRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PasskeyCredentialEntity>()
            .FirstOrDefaultAsync(x => x.CredentialId == credentialId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IEnumerable<PasskeyCredential>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<PasskeyCredentialEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain);
    }

    public async Task<PasskeyCredential> AddAsync(PasskeyCredential credential, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(credential);
        await _dbContext.Set<PasskeyCredentialEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(PasskeyCredential credential, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PasskeyCredentialEntity>()
            .FirstOrDefaultAsync(x => x.Id == credential.Id, cancellationToken);
        if (entity != null)
        {
            entity.SignCounter = credential.SignCounter;
            entity.LastUsedAt = credential.LastUsedAt;
            entity.DeviceName = credential.DeviceName;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PasskeyCredentialEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<PasskeyCredentialEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static PasskeyCredential MapToDomain(PasskeyCredentialEntity entity) => new()
    {
        Id = entity.Id,
        TenantUserId = entity.TenantUserId,
        CredentialId = entity.CredentialId,
        PublicKey = entity.PublicKey,
        SignCounter = entity.SignCounter,
        CredType = entity.CredType,
        AaGuid = entity.AaGuid,
        UserHandle = entity.UserHandle,
        DeviceName = entity.DeviceName,
        CreatedAt = entity.CreatedAt,
        LastUsedAt = entity.LastUsedAt,
        Transports = entity.Transports
    };

    private static PasskeyCredentialEntity MapToEntity(PasskeyCredential credential) => new()
    {
        Id = credential.Id,
        TenantUserId = credential.TenantUserId,
        CredentialId = credential.CredentialId,
        PublicKey = credential.PublicKey,
        SignCounter = credential.SignCounter,
        CredType = credential.CredType,
        AaGuid = credential.AaGuid,
        UserHandle = credential.UserHandle,
        DeviceName = credential.DeviceName,
        CreatedAt = credential.CreatedAt,
        LastUsedAt = credential.LastUsedAt,
        Transports = credential.Transports
    };
}
