using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class AuthorizationCodeRepository : IAuthorizationCodeRepository
{
    private readonly DbContext _dbContext;

    public AuthorizationCodeRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AuthorizationCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AuthorizationCodeEntity>()
            .FirstOrDefaultAsync(x => x.Code == code && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow, cancellationToken);
        
        return entity?.ToDomain();
    }

    public async Task<AuthorizationCode> AddAsync(AuthorizationCode authorizationCode, CancellationToken cancellationToken = default)
    {
        var entity = AuthorizationCodeEntity.FromDomain(authorizationCode);
        await _dbContext.Set<AuthorizationCodeEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(AuthorizationCode authorizationCode, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AuthorizationCodeEntity>()
            .FirstOrDefaultAsync(x => x.Id == authorizationCode.Id, cancellationToken);
        
        if (entity != null)
        {
            entity.IsUsed = authorizationCode.IsUsed;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteExpiredCodesAsync(CancellationToken cancellationToken = default)
    {
        var expiredCodes = await _dbContext.Set<AuthorizationCodeEntity>()
            .Where(x => x.ExpiresAt < DateTime.UtcNow || x.IsUsed)
            .ToListAsync(cancellationToken);
        
        _dbContext.Set<AuthorizationCodeEntity>().RemoveRange(expiredCodes);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

