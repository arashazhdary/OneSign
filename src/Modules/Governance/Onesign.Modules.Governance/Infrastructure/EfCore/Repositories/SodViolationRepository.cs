using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Governance.Domain.Entities;
using Onesign.Modules.Governance.Domain.Repositories;
using Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Repositories;

public class SodViolationRepository : ISodViolationRepository
{
    private readonly DbContext _dbContext;

    public SodViolationRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<SodViolation>> GetByTenantIdAsync(Guid tenantId, bool? resolved, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<SodViolationEntity>()
            .Where(x => x.TenantId == tenantId);

        if (resolved.HasValue)
        {
            query = query.Where(x => x.Resolved == resolved.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<SodViolation> AddAsync(SodViolation violation, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(violation);
        await _dbContext.Set<SodViolationEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        violation.Id = entity.Id;
        return violation;
    }

    public async Task UpdateAsync(SodViolation violation, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SodViolationEntity>()
            .FirstOrDefaultAsync(x => x.Id == violation.Id, cancellationToken);

        if (entity != null)
        {
            entity.Severity = violation.Severity;
            entity.Description = violation.Description;
            entity.Resolved = violation.Resolved;
            entity.ResolvedAt = violation.ResolvedAt;
            entity.ResolutionNotes = violation.ResolutionNotes;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static SodViolation MapToDomain(SodViolationEntity e)
    {
        return new SodViolation
        {
            Id = e.Id,
            TenantId = e.TenantId,
            RuleId = e.RuleId,
            UserId = e.UserId,
            Severity = e.Severity,
            Description = e.Description,
            DetectedAt = e.DetectedAt,
            Resolved = e.Resolved,
            ResolvedAt = e.ResolvedAt,
            ResolutionNotes = e.ResolutionNotes
        };
    }

    private static SodViolationEntity MapToEntity(SodViolation d)
    {
        return new SodViolationEntity
        {
            Id = d.Id,
            TenantId = d.TenantId,
            RuleId = d.RuleId,
            UserId = d.UserId,
            Severity = d.Severity,
            Description = d.Description,
            DetectedAt = d.DetectedAt,
            Resolved = d.Resolved,
            ResolvedAt = d.ResolvedAt,
            ResolutionNotes = d.ResolutionNotes
        };
    }
}
