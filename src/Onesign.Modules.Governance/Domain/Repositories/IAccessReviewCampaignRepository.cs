using Onesign.Modules.Governance.Domain.Entities;

namespace Onesign.Modules.Governance.Domain.Repositories;

public interface IAccessReviewCampaignRepository
{
    Task<List<AccessReviewCampaign>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<AccessReviewCampaign?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AccessReviewCampaign> AddAsync(AccessReviewCampaign campaign, CancellationToken cancellationToken = default);
    Task UpdateAsync(AccessReviewCampaign campaign, CancellationToken cancellationToken = default);
}
