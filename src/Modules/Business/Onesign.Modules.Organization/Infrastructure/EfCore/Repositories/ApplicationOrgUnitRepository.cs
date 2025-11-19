using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;

public class ApplicationOrgUnitRepository : IApplicationOrgUnitRepository
{
    private readonly DbContext _dbContext;

    public ApplicationOrgUnitRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ApplicationOrgUnit>> GetByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApplicationOrgUnitEntity>()
            .Where(x => x.ApplicationClientId == applicationClientId)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<ApplicationOrgUnit>> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApplicationOrgUnitEntity>()
            .Where(x => x.OrgUnitId == orgUnitId)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<ApplicationOrgUnit>> GetByOrgUnitAndDescendantsAsync(Guid orgUnitId, List<Guid> descendantIds, CancellationToken cancellationToken = default)
    {
        var allOrgUnitIds = new List<Guid> { orgUnitId };
        allOrgUnitIds.AddRange(descendantIds);

        var entities = await _dbContext.Set<ApplicationOrgUnitEntity>()
            .Where(x => allOrgUnitIds.Contains(x.OrgUnitId))
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task AddAsync(ApplicationOrgUnit applicationOrgUnit, CancellationToken cancellationToken = default)
    {
        var entity = ApplicationOrgUnitEntity.FromDomain(applicationOrgUnit);
        await _dbContext.Set<ApplicationOrgUnitEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(List<ApplicationOrgUnit> applicationOrgUnits, CancellationToken cancellationToken = default)
    {
        var entities = applicationOrgUnits.Select(ApplicationOrgUnitEntity.FromDomain).ToList();
        await _dbContext.Set<ApplicationOrgUnitEntity>().AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApplicationOrgUnitEntity>()
            .Where(x => x.ApplicationClientId == applicationClientId)
            .ToListAsync(cancellationToken);
        _dbContext.Set<ApplicationOrgUnitEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid applicationClientId, Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApplicationOrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.ApplicationClientId == applicationClientId && x.OrgUnitId == orgUnitId, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<ApplicationOrgUnitEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> HasApplicationsAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<ApplicationOrgUnitEntity>()
            .AnyAsync(x => x.OrgUnitId == orgUnitId, cancellationToken);
    }
}

