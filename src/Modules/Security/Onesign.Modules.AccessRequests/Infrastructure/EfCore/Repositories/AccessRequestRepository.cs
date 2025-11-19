using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Repositories;

public class AccessRequestRepository : IAccessRequestRepository
{
    private readonly OnesignDbContext _dbContext;

    public AccessRequestRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AccessRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AccessRequestEntity>()
            .Include(x => x.Items)
            .Include(x => x.ApprovalSteps)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<AccessRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AccessRequestEntity>()
            .Include(x => x.Items)
            .Include(x => x.ApprovalSteps)
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<AccessRequest>> GetByRequesterAsync(Guid tenantId, Guid requesterId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AccessRequestEntity>()
            .Include(x => x.Items)
            .Include(x => x.ApprovalSteps)
            .Where(x => x.TenantId == tenantId && x.RequesterId == requesterId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<AccessRequest>> GetPendingForApproverAsync(Guid tenantId, Guid approverId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AccessRequestEntity>()
            .Include(x => x.Items)
            .Include(x => x.ApprovalSteps)
            .Where(x => x.TenantId == tenantId &&
                       x.ApprovalSteps.Any(s => s.ApproverId == approverId && s.Action == null))
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(request);
        await _dbContext.Set<AccessRequestEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(request);
        _dbContext.Set<AccessRequestEntity>().Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static AccessRequest MapToDomain(AccessRequestEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        RequesterId = e.RequesterId,
        RequesterName = e.RequesterName,
        Status = (RequestStatus)e.Status,
        Justification = e.Justification,
        CreatedAt = e.CreatedAt,
        ReviewedAt = e.ReviewedAt,
        ReviewedBy = e.ReviewedBy,
        ReviewComment = e.ReviewComment,
        Items = e.Items.Select(i => new AccessRequestItem
        {
            Id = i.Id,
            AccessRequestId = i.AccessRequestId,
            AccessType = (AccessType)i.AccessType,
            TargetId = i.TargetId,
            TargetName = i.TargetName,
            DurationMinutes = i.DurationMinutes,
            Status = (RequestStatus)i.Status
        }).ToList(),
        ApprovalSteps = e.ApprovalSteps.Select(s => new ApprovalStep
        {
            Id = s.Id,
            AccessRequestId = s.AccessRequestId,
            StepNumber = s.StepNumber,
            ApproverId = s.ApproverId,
            ApproverName = s.ApproverName,
            Action = s.Action.HasValue ? (ApprovalAction)s.Action.Value : null,
            Comment = s.Comment,
            ActionAt = s.ActionAt,
            IsRequired = s.IsRequired
        }).ToList()
    };

    private static AccessRequestEntity MapToEntity(AccessRequest d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        RequesterId = d.RequesterId,
        RequesterName = d.RequesterName,
        Status = (int)d.Status,
        Justification = d.Justification,
        CreatedAt = d.CreatedAt,
        ReviewedAt = d.ReviewedAt,
        ReviewedBy = d.ReviewedBy,
        ReviewComment = d.ReviewComment,
        Items = d.Items.Select(i => new AccessRequestItemEntity
        {
            Id = i.Id,
            AccessRequestId = i.AccessRequestId,
            AccessType = (int)i.AccessType,
            TargetId = i.TargetId,
            TargetName = i.TargetName,
            DurationMinutes = i.DurationMinutes,
            Status = (int)i.Status
        }).ToList(),
        ApprovalSteps = d.ApprovalSteps.Select(s => new ApprovalStepEntity
        {
            Id = s.Id,
            AccessRequestId = s.AccessRequestId,
            StepNumber = s.StepNumber,
            ApproverId = s.ApproverId,
            ApproverName = s.ApproverName,
            Action = s.Action.HasValue ? (int)s.Action.Value : null,
            Comment = s.Comment,
            ActionAt = s.ActionAt,
            IsRequired = s.IsRequired
        }).ToList()
    };
}
