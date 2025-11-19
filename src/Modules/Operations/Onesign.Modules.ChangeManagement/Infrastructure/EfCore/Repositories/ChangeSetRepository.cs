using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Repositories;

public class ChangeSetRepository : IChangeSetRepository
{
    private readonly OnesignDbContext _dbContext;

    public ChangeSetRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChangeSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<ChangeSet?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeSetEntity>()
            .Include(x => x.Items)
            .Include(x => x.Approvals)
            .Include(x => x.ExecutionLogs)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithDetails(entity) : null;
    }

    public async Task<IReadOnlyList<ChangeSet>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeSetEntity>()
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ChangeSet>> GetByStatusAsync(string scopeType, Guid scopeId, ChangeSetStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeSetEntity>()
            .Include(x => x.Items)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId && x.Status == (int)status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task<IReadOnlyList<ChangeSet>> GetPendingApprovalsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ChangeSetEntity>()
            .Include(x => x.Items)
            .Include(x => x.Approvals)
            .Where(x => x.Status == (int)ChangeSetStatus.InReview)
            .Where(x => !x.Approvals.Any(a => a.ApproverUserId == userId))
            .Where(x => x.RequestedByUserId != userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task<(IReadOnlyList<ChangeSet> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        ChangeSetStatus? status,
        ChangeCategory? category,
        Guid? requestedByUserId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<ChangeSetEntity>()
            .Include(x => x.Items)
            .Where(x => x.ScopeType == scopeType && x.ScopeId == scopeId);

        if (status.HasValue)
            query = query.Where(x => x.Status == (int)status.Value);

        if (category.HasValue)
            query = query.Where(x => x.Category == (int)category.Value);

        if (requestedByUserId.HasValue)
            query = query.Where(x => x.RequestedByUserId == requestedByUserId.Value);

        if (fromDate.HasValue)
            query = query.Where(x => x.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.CreatedAt <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (entities.Select(MapToDomainWithDetails).ToList(), totalCount);
    }

    public async Task AddAsync(ChangeSet changeSet, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(changeSet);
        await _dbContext.Set<ChangeSetEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ChangeSet changeSet, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<ChangeSetEntity>()
            .Include(x => x.Items)
            .Include(x => x.Approvals)
            .Include(x => x.ExecutionLogs)
            .FirstOrDefaultAsync(x => x.Id == changeSet.Id, cancellationToken);

        if (existing == null)
            return;

        existing.Title = changeSet.Title;
        existing.Description = changeSet.Description;
        existing.Category = (int)changeSet.Category;
        existing.Status = (int)changeSet.Status;
        existing.UpdatedAt = changeSet.UpdatedAt;
        existing.ApprovedByUserId = changeSet.ApprovedByUserId;
        existing.ApprovedAt = changeSet.ApprovedAt;
        existing.ScheduledFor = changeSet.ScheduledFor;
        existing.AppliedAt = changeSet.AppliedAt;
        existing.RolledBackAt = changeSet.RolledBackAt;
        existing.RollbackReason = changeSet.RollbackReason;
        existing.SimulationSummaryJson = changeSet.SimulationSummaryJson;

        _dbContext.Set<ChangeItemEntity>().RemoveRange(existing.Items);
        foreach (var item in changeSet.Items)
        {
            existing.Items.Add(new ChangeItemEntity
            {
                Id = item.Id,
                ChangeSetId = changeSet.Id,
                TargetType = (int)item.TargetType,
                TargetId = item.TargetId,
                Operation = (int)item.Operation,
                CurrentValueJson = item.CurrentValueJson,
                ProposedValueJson = item.ProposedValueJson,
                Order = item.Order
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ChangeSetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<ChangeSetEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ChangeSet MapToDomain(ChangeSetEntity e) => new()
    {
        Id = e.Id,
        ScopeType = e.ScopeType,
        ScopeId = e.ScopeId,
        Title = e.Title,
        Description = e.Description,
        Category = (ChangeCategory)e.Category,
        Status = (ChangeSetStatus)e.Status,
        RequestedByUserId = e.RequestedByUserId,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,
        ApprovedByUserId = e.ApprovedByUserId,
        ApprovedAt = e.ApprovedAt,
        ScheduledFor = e.ScheduledFor,
        AppliedAt = e.AppliedAt,
        RolledBackAt = e.RolledBackAt,
        RollbackReason = e.RollbackReason,
        SimulationSummaryJson = e.SimulationSummaryJson
    };

    private static ChangeSet MapToDomainWithDetails(ChangeSetEntity e)
    {
        var changeSet = MapToDomain(e);

        changeSet.Items = e.Items.OrderBy(i => i.Order).Select(i => new ChangeItem
        {
            Id = i.Id,
            ChangeSetId = i.ChangeSetId,
            TargetType = (ChangeTargetType)i.TargetType,
            TargetId = i.TargetId,
            Operation = (ChangeOperation)i.Operation,
            CurrentValueJson = i.CurrentValueJson,
            ProposedValueJson = i.ProposedValueJson,
            Order = i.Order
        }).ToList();

        changeSet.Approvals = e.Approvals.Select(a => new ChangeApproval
        {
            Id = a.Id,
            ChangeSetId = a.ChangeSetId,
            ApproverUserId = a.ApproverUserId,
            Decision = (ApprovalDecision)a.Decision,
            Reason = a.Reason,
            DecidedAt = a.DecidedAt
        }).ToList();

        changeSet.ExecutionLogs = e.ExecutionLogs.OrderBy(l => l.CreatedAt).Select(l => new ChangeExecutionLog
        {
            Id = l.Id,
            ChangeSetId = l.ChangeSetId,
            ItemId = l.ItemId,
            Step = (ExecutionStep)l.Step,
            Status = l.Status,
            Message = l.Message,
            CreatedAt = l.CreatedAt
        }).ToList();

        return changeSet;
    }

    private static ChangeSetEntity MapToEntity(ChangeSet d)
    {
        var entity = new ChangeSetEntity
        {
            Id = d.Id,
            ScopeType = d.ScopeType,
            ScopeId = d.ScopeId,
            Title = d.Title,
            Description = d.Description,
            Category = (int)d.Category,
            Status = (int)d.Status,
            RequestedByUserId = d.RequestedByUserId,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
            ApprovedByUserId = d.ApprovedByUserId,
            ApprovedAt = d.ApprovedAt,
            ScheduledFor = d.ScheduledFor,
            AppliedAt = d.AppliedAt,
            RolledBackAt = d.RolledBackAt,
            RollbackReason = d.RollbackReason,
            SimulationSummaryJson = d.SimulationSummaryJson
        };

        foreach (var item in d.Items)
        {
            entity.Items.Add(new ChangeItemEntity
            {
                Id = item.Id,
                ChangeSetId = d.Id,
                TargetType = (int)item.TargetType,
                TargetId = item.TargetId,
                Operation = (int)item.Operation,
                CurrentValueJson = item.CurrentValueJson,
                ProposedValueJson = item.ProposedValueJson,
                Order = item.Order
            });
        }

        foreach (var approval in d.Approvals)
        {
            entity.Approvals.Add(new ChangeApprovalEntity
            {
                Id = approval.Id,
                ChangeSetId = d.Id,
                ApproverUserId = approval.ApproverUserId,
                Decision = (int)approval.Decision,
                Reason = approval.Reason,
                DecidedAt = approval.DecidedAt
            });
        }

        foreach (var log in d.ExecutionLogs)
        {
            entity.ExecutionLogs.Add(new ChangeExecutionLogEntity
            {
                Id = log.Id,
                ChangeSetId = d.Id,
                ItemId = log.ItemId,
                Step = (int)log.Step,
                Status = log.Status,
                Message = log.Message,
                CreatedAt = log.CreatedAt
            });
        }

        return entity;
    }
}
