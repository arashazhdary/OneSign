using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Governance.Domain.Entities;
using Onesign.Modules.Governance.Domain.Repositories;
using Onesign.Modules.Governance.Infrastructure.EfCore.Entities;
using System.Text.Json;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Repositories;

public class AccessReviewCampaignRepository : IAccessReviewCampaignRepository
{
    private readonly DbContext _dbContext;

    public AccessReviewCampaignRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<AccessReviewCampaign>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AccessReviewCampaignEntity>()
            .Where(x => x.TenantId == tenantId)
            .Include(x => x.ReviewItems)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<AccessReviewCampaign?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AccessReviewCampaignEntity>()
            .Include(x => x.ReviewItems)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<AccessReviewCampaign> AddAsync(AccessReviewCampaign campaign, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(campaign);
        await _dbContext.Set<AccessReviewCampaignEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        campaign.Id = entity.Id;
        return campaign;
    }

    public async Task UpdateAsync(AccessReviewCampaign campaign, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AccessReviewCampaignEntity>()
            .FirstOrDefaultAsync(x => x.Id == campaign.Id, cancellationToken);

        if (entity != null)
        {
            entity.Name = campaign.Name;
            entity.Description = campaign.Description;
            entity.Status = campaign.Status;
            entity.StartDate = campaign.StartDate;
            entity.EndDate = campaign.EndDate;
            entity.TargetRolesJson = JsonSerializer.Serialize(campaign.TargetRoles);
            entity.TargetResourcesJson = JsonSerializer.Serialize(campaign.TargetResources);

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static AccessReviewCampaign MapToDomain(AccessReviewCampaignEntity e)
    {
        var campaign = new AccessReviewCampaign
        {
            Id = e.Id,
            TenantId = e.TenantId,
            Name = e.Name,
            Description = e.Description,
            Status = e.Status,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            TargetRoles = JsonSerializer.Deserialize<List<string>>(e.TargetRolesJson) ?? new List<string>(),
            TargetResources = JsonSerializer.Deserialize<List<string>>(e.TargetResourcesJson) ?? new List<string>(),
            CreatedBy = e.CreatedBy,
            CreatedAt = e.CreatedAt
        };

        return campaign;
    }

    private static AccessReviewCampaignEntity MapToEntity(AccessReviewCampaign d)
    {
        return new AccessReviewCampaignEntity
        {
            Id = d.Id,
            TenantId = d.TenantId,
            Name = d.Name,
            Description = d.Description,
            Status = d.Status,
            StartDate = d.StartDate,
            EndDate = d.EndDate,
            TargetRolesJson = JsonSerializer.Serialize(d.TargetRoles),
            TargetResourcesJson = JsonSerializer.Serialize(d.TargetResources),
            CreatedBy = d.CreatedBy,
            CreatedAt = d.CreatedAt
        };
    }
}
