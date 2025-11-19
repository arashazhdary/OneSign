using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;

public class PlanRepository : IPlanRepository
{
    private readonly DbContext _dbContext;

    public PlanRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Plan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlanEntity>()
            .Include(p => p.Features)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<Plan?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlanEntity>()
            .Include(p => p.Features)
            .FirstOrDefaultAsync(x => x.Code == code, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<Plan>> GetAllAsync(bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<PlanEntity>()
            .Include(p => p.Features)
            .AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        var entities = await query.ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<Plan> AddAsync(Plan plan, CancellationToken cancellationToken = default)
    {
        var entity = PlanEntity.FromDomain(plan);
        await _dbContext.Set<PlanEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(Plan plan, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlanEntity>()
            .Include(p => p.Features)
            .FirstOrDefaultAsync(x => x.Id == plan.Id, cancellationToken);

        if (entity == null)
            throw new InvalidOperationException($"Plan with ID {plan.Id} not found");

        entity.Name = plan.Name;
        entity.Code = plan.Code;
        entity.Type = plan.Type;
        entity.IsActive = plan.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        // Update features
        entity.Features.Clear();
        foreach (var feature in plan.Features)
        {
            entity.Features.Add(PlanFeatureEntity.FromDomain(feature));
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PlanEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<PlanEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
