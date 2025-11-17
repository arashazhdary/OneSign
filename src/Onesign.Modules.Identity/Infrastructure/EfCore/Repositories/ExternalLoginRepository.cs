using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class ExternalLoginRepository : IExternalLoginRepository
{
    private readonly DbContext _dbContext;

    public ExternalLoginRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ExternalLogin?> GetByProviderAndProviderUserIdAsync(string provider, string providerUserId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ExternalLoginEntity>()
            .FirstOrDefaultAsync(x => x.Provider == provider && x.ProviderUserId == providerUserId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<ExternalLogin> AddAsync(ExternalLogin externalLogin, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(externalLogin);
        await _dbContext.Set<ExternalLoginEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    private static ExternalLogin MapToDomain(ExternalLoginEntity entity) => new()
    {
        Id = entity.Id,
        GlobalUserId = entity.GlobalUserId,
        Provider = entity.Provider,
        ProviderUserId = entity.ProviderUserId,
        CreatedAt = entity.CreatedAt
    };

    private static ExternalLoginEntity MapToEntity(ExternalLogin externalLogin) => new()
    {
        Id = externalLogin.Id,
        GlobalUserId = externalLogin.GlobalUserId,
        Provider = externalLogin.Provider,
        ProviderUserId = externalLogin.ProviderUserId,
        CreatedAt = externalLogin.CreatedAt
    };
}

