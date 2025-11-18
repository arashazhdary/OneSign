using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Repositories;

public class HRIdentityRecordRepository : IHRIdentityRecordRepository
{
    private readonly OnesignDbContext _dbContext;

    public HRIdentityRecordRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HRIdentityRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<HRIdentityRecordEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<HRIdentityRecord?> GetByExternalIdAsync(Guid tenantId, string externalEmployeeId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<HRIdentityRecordEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ExternalEmployeeId == externalEmployeeId, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<HRIdentityRecord>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<HRIdentityRecordEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.LastName)
            .ThenBy(x => x.FirstName)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(HRIdentityRecord record, CancellationToken ct = default)
    {
        var entity = MapToEntity(record);
        await _dbContext.Set<HRIdentityRecordEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(HRIdentityRecord record, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<HRIdentityRecordEntity>()
            .FirstOrDefaultAsync(x => x.Id == record.Id, ct);

        if (entity != null)
        {
            entity.ExternalEmployeeId = record.ExternalEmployeeId;
            entity.FirstName = record.FirstName;
            entity.LastName = record.LastName;
            entity.Email = record.Email;
            entity.OrgUnitCode = record.OrgUnitCode;
            entity.JobRole = record.JobRole;
            entity.ManagerEmployeeId = record.ManagerEmployeeId;
            entity.Status = (int)record.Status;
            entity.StartDate = record.StartDate;
            entity.EndDate = record.EndDate;
            entity.LastSyncedAt = record.LastSyncedAt;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static HRIdentityRecord MapToDomain(HRIdentityRecordEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        ExternalEmployeeId = e.ExternalEmployeeId,
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        OrgUnitCode = e.OrgUnitCode,
        JobRole = e.JobRole,
        ManagerEmployeeId = e.ManagerEmployeeId,
        Status = (EmploymentStatus)e.Status,
        StartDate = e.StartDate,
        EndDate = e.EndDate,
        LastSyncedAt = e.LastSyncedAt
    };

    private static HRIdentityRecordEntity MapToEntity(HRIdentityRecord d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        ExternalEmployeeId = d.ExternalEmployeeId,
        FirstName = d.FirstName,
        LastName = d.LastName,
        Email = d.Email,
        OrgUnitCode = d.OrgUnitCode,
        JobRole = d.JobRole,
        ManagerEmployeeId = d.ManagerEmployeeId,
        Status = (int)d.Status,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        LastSyncedAt = d.LastSyncedAt
    };
}
