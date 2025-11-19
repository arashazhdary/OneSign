using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;

public class ChangeApprovalRepository : IChangeApprovalRepository
{
    private readonly OnesignDbContext _dbContext;

    public ChangeApprovalRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChangeApproval?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeApprovalEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<ChangeApproval>> GetByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeApprovalEntity>()
            .Where(x => x.ChangeSetId == changeSetId)
            .OrderBy(x => x.DecidedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<ChangeApproval?> GetByChangeSetAndUserAsync(Guid changeSetId, Guid userId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeApprovalEntity>()
            .FirstOrDefaultAsync(x => x.ChangeSetId == changeSetId && x.ApproverUserId == userId, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(ChangeApproval approval, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(approval);
        await _dbContext.Set<ChangeApprovalEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeApprovalEntity>()
            .Where(x => x.ChangeSetId == changeSetId)
            .ToListAsync(cancellationToken);

        if (entities.Any())
        {
            _dbContext.Set<ChangeApprovalEntity>().RemoveRange(entities);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ChangeApproval MapToDomain(ChangeApprovalEntity e) => new()
    {
        Id = e.Id,
        ChangeSetId = e.ChangeSetId,
        ApproverUserId = e.ApproverUserId,
        Decision = (ApprovalDecision)e.Decision,
        Reason = e.Reason,
        DecidedAt = e.DecidedAt
    };

    private static ChangeApprovalEntity MapToEntity(ChangeApproval d) => new()
    {
        Id = d.Id,
        ChangeSetId = d.ChangeSetId,
        ApproverUserId = d.ApproverUserId,
        Decision = (int)d.Decision,
        Reason = d.Reason,
        DecidedAt = d.DecidedAt
    };
}
