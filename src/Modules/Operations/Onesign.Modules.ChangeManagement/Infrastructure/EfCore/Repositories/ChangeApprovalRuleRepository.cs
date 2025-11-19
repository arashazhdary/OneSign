using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;

public class ChangeApprovalRuleRepository : IChangeApprovalRuleRepository
{
    private readonly OnesignDbContext _dbContext;

    public ChangeApprovalRuleRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChangeApprovalRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeApprovalRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<ChangeApprovalRule?> GetByScopeAndCategoryAsync(string scopeType, Guid scopeId, ChangeCategory category, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeApprovalRuleEntity>()
            .FirstOrDefaultAsync(x => x.ScopeType == scopeType && x.ScopeId == scopeId && x.Category == (int)category, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<ChangeApprovalRule>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeApprovalRuleEntity>()
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(ChangeApprovalRule rule, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(rule);
        await _dbContext.Set<ChangeApprovalRuleEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ChangeApprovalRule rule, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<ChangeApprovalRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == rule.Id, cancellationToken);

        if (existing == null)
            return;

        existing.MinApprovers = rule.MinApprovers;
        existing.RequireSeparationOfDuties = rule.RequireSeparationOfDuties;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeApprovalRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<ChangeApprovalRuleEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ChangeApprovalRule MapToDomain(ChangeApprovalRuleEntity e) => new()
    {
        Id = e.Id,
        ScopeType = e.ScopeType,
        ScopeId = e.ScopeId,
        Category = (ChangeCategory)e.Category,
        MinApprovers = e.MinApprovers,
        RequireSeparationOfDuties = e.RequireSeparationOfDuties
    };

    private static ChangeApprovalRuleEntity MapToEntity(ChangeApprovalRule d) => new()
    {
        Id = d.Id,
        ScopeType = d.ScopeType,
        ScopeId = d.ScopeId,
        Category = (int)d.Category,
        MinApprovers = d.MinApprovers,
        RequireSeparationOfDuties = d.RequireSeparationOfDuties
    };
}
