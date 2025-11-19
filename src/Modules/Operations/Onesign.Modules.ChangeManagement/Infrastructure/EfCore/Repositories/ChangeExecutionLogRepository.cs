using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;

public class ChangeExecutionLogRepository : IChangeExecutionLogRepository
{
    private readonly OnesignDbContext _dbContext;

    public ChangeExecutionLogRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<ChangeExecutionLog>> GetByChangeSetIdAsync(Guid changeSetId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeExecutionLogEntity>()
            .Where(x => x.ChangeSetId == changeSetId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ChangeExecutionLog>> GetByChangeSetAndStepAsync(Guid changeSetId, ExecutionStep step, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeExecutionLogEntity>()
            .Where(x => x.ChangeSetId == changeSetId && x.Step == (int)step)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(ChangeExecutionLog log, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(log);
        await _dbContext.Set<ChangeExecutionLogEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<ChangeExecutionLog> logs, CancellationToken cancellationToken = default)
    {
        var entities = logs.Select(MapToEntity).ToList();
        await _dbContext.Set<ChangeExecutionLogEntity>().AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ChangeExecutionLog MapToDomain(ChangeExecutionLogEntity e) => new()
    {
        Id = e.Id,
        ChangeSetId = e.ChangeSetId,
        ItemId = e.ItemId,
        Step = (ExecutionStep)e.Step,
        Status = e.Status,
        Message = e.Message,
        CreatedAt = e.CreatedAt
    };

    private static ChangeExecutionLogEntity MapToEntity(ChangeExecutionLog d) => new()
    {
        Id = d.Id,
        ChangeSetId = d.ChangeSetId,
        ItemId = d.ItemId,
        Step = (int)d.Step,
        Status = d.Status,
        Message = d.Message,
        CreatedAt = d.CreatedAt
    };
}
