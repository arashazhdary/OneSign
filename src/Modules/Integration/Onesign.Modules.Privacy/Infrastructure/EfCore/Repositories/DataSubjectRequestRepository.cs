using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Repositories;

public class DataSubjectRequestRepository : IDataSubjectRequestRepository
{
    private readonly DbContext _dbContext;

    public DataSubjectRequestRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DataSubjectRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataSubjectRequestEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<DataSubjectRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataSubjectRequestEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DataSubjectRequest>> GetBySubjectIdAsync(Guid subjectId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataSubjectRequestEntity>()
            .Where(x => x.SubjectId == subjectId)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DataSubjectRequest>> GetByStatusAsync(DataSubjectRequestStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataSubjectRequestEntity>()
            .Where(x => x.Status == (int)status)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DataSubjectRequest>> GetByTypeAsync(DataSubjectRequestType type, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataSubjectRequestEntity>()
            .Where(x => x.Type == (int)type)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DataSubjectRequest>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        var pendingStatuses = new[]
        {
            (int)DataSubjectRequestStatus.Requested,
            (int)DataSubjectRequestStatus.InReview,
            (int)DataSubjectRequestStatus.Approved,
            (int)DataSubjectRequestStatus.Processing
        };

        var entities = await _dbContext.Set<DataSubjectRequestEntity>()
            .Where(x => pendingStatuses.Contains(x.Status))
            .OrderBy(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(DataSubjectRequest request, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(request);
        await _dbContext.Set<DataSubjectRequestEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(DataSubjectRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataSubjectRequestEntity>()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity != null)
        {
            entity.Status = (int)request.Status;
            entity.CompletedAt = request.CompletedAt;
            entity.ResultLocation = request.ResultLocation;
            entity.Reason = request.Reason;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataSubjectRequestEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<DataSubjectRequestEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static DataSubjectRequest MapToDomain(DataSubjectRequestEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        SubjectId = e.SubjectId,
        Type = (DataSubjectRequestType)e.Type,
        Status = (DataSubjectRequestStatus)e.Status,
        RequestedAt = e.RequestedAt,
        RequestedBy = e.RequestedBy,
        CompletedAt = e.CompletedAt,
        ResultLocation = e.ResultLocation,
        Reason = e.Reason
    };

    private static DataSubjectRequestEntity MapToEntity(DataSubjectRequest d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        SubjectId = d.SubjectId,
        Type = (int)d.Type,
        Status = (int)d.Status,
        RequestedAt = d.RequestedAt,
        RequestedBy = d.RequestedBy,
        CompletedAt = d.CompletedAt,
        ResultLocation = d.ResultLocation,
        Reason = d.Reason
    };
}
