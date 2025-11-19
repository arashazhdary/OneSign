using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Repositories;

public class AutomationExecutionRepository : IAutomationExecutionRepository
{
    private readonly OnesignDbContext _dbContext;

    public AutomationExecutionRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AutomationExecution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AutomationExecutionEntity>()
            .Include(x => x.Workflow)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<AutomationExecution>> GetByTenantIdAsync(
        Guid tenantId,
        Guid? workflowId = null,
        ExecutionStatus? status = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(tenantId, workflowId, status, from, to);

        var entities = await query
            .OrderByDescending(x => x.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetCountByTenantIdAsync(
        Guid tenantId,
        Guid? workflowId = null,
        ExecutionStatus? status = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(tenantId, workflowId, status, from, to);
        return await query.CountAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid workflowId, string eventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<AutomationExecutionEntity>()
            .AnyAsync(x => x.WorkflowId == workflowId && x.EventId == eventId, cancellationToken);
    }

    public async Task AddAsync(AutomationExecution execution, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(execution);
        await _dbContext.Set<AutomationExecutionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(AutomationExecution execution, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AutomationExecutionEntity>()
            .FirstOrDefaultAsync(x => x.Id == execution.Id, cancellationToken);

        if (entity == null)
            return;

        entity.CompletedAt = execution.CompletedAt;
        entity.Status = (int)execution.Status;
        entity.ErrorMessage = execution.ErrorMessage;
        entity.ActionsExecutedCount = execution.ActionsExecutedCount;
        entity.ActionsFailedCount = execution.ActionsFailedCount;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<AutomationExecutionEntity> BuildQuery(
        Guid tenantId,
        Guid? workflowId,
        ExecutionStatus? status,
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var query = _dbContext.Set<AutomationExecutionEntity>()
            .Include(x => x.Workflow)
            .Where(x => x.TenantId == tenantId);

        if (workflowId.HasValue)
            query = query.Where(x => x.WorkflowId == workflowId.Value);

        if (status.HasValue)
            query = query.Where(x => x.Status == (int)status.Value);

        if (from.HasValue)
            query = query.Where(x => x.StartedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.StartedAt <= to.Value);

        return query;
    }

    private static AutomationExecution MapToDomain(AutomationExecutionEntity e) => new()
    {
        Id = e.Id,
        WorkflowId = e.WorkflowId,
        TenantId = e.TenantId,
        EventType = e.EventType,
        EventId = e.EventId,
        StartedAt = e.StartedAt,
        CompletedAt = e.CompletedAt,
        Status = (ExecutionStatus)e.Status,
        ErrorMessage = e.ErrorMessage,
        ActionsExecutedCount = e.ActionsExecutedCount,
        ActionsFailedCount = e.ActionsFailedCount,
        PayloadSnapshot = e.PayloadSnapshot,
        WorkflowName = e.Workflow?.Name
    };

    private static AutomationExecutionEntity MapToEntity(AutomationExecution d) => new()
    {
        Id = d.Id,
        WorkflowId = d.WorkflowId,
        TenantId = d.TenantId,
        EventType = d.EventType,
        EventId = d.EventId,
        StartedAt = d.StartedAt,
        CompletedAt = d.CompletedAt,
        Status = (int)d.Status,
        ErrorMessage = d.ErrorMessage,
        ActionsExecutedCount = d.ActionsExecutedCount,
        ActionsFailedCount = d.ActionsFailedCount,
        PayloadSnapshot = d.PayloadSnapshot
    };
}
