using Onesign.Modules.Developer.Domain.Entities;

namespace Onesign.Modules.Developer.Domain.Repositories;

public interface IApiUsageLogRepository
{
    Task<ApiUsageLog> AddAsync(ApiUsageLog log, CancellationToken cancellationToken = default);
    Task<List<ApiUsageLog>> GetByTenantIdAsync(Guid tenantId, DateTime from, DateTime to, int skip, int take, CancellationToken cancellationToken = default);
    Task<List<ApiUsageLog>> GetByApiKeyIdAsync(Guid apiKeyId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<int> GetUsageCountAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken cancellationToken = default);
}
