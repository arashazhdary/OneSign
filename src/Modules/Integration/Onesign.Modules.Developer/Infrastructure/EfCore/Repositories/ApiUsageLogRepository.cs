using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Repositories;

public class ApiUsageLogRepository : IApiUsageLogRepository
{
    private readonly DbContext _dbContext;

    public ApiUsageLogRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApiUsageLog> AddAsync(ApiUsageLog log, CancellationToken cancellationToken = default)
    {
        var entity = new ApiUsageLogEntity
        {
            Id = log.Id,
            TenantId = log.TenantId,
            ApiKeyId = log.ApiKeyId,
            ServiceAccountId = log.ServiceAccountId,
            Endpoint = log.Endpoint,
            HttpMethod = log.HttpMethod,
            StatusCode = log.StatusCode,
            ResponseTimeMs = log.ResponseTimeMs,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            RequestedAt = log.RequestedAt
        };

        _dbContext.Set<ApiUsageLogEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return log;
    }

    public async Task<List<ApiUsageLog>> GetByTenantIdAsync(Guid tenantId, DateTime from, DateTime to, int skip, int take, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApiUsageLogEntity>()
            .Where(x => x.TenantId == tenantId && x.RequestedAt >= from && x.RequestedAt <= to)
            .OrderByDescending(x => x.RequestedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return entities.Select(e => new ApiUsageLog
        {
            Id = e.Id,
            TenantId = e.TenantId,
            ApiKeyId = e.ApiKeyId,
            ServiceAccountId = e.ServiceAccountId,
            Endpoint = e.Endpoint,
            HttpMethod = e.HttpMethod,
            StatusCode = e.StatusCode,
            ResponseTimeMs = e.ResponseTimeMs,
            IpAddress = e.IpAddress,
            UserAgent = e.UserAgent,
            RequestedAt = e.RequestedAt
        }).ToList();
    }

    public async Task<List<ApiUsageLog>> GetByApiKeyIdAsync(Guid apiKeyId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApiUsageLogEntity>()
            .Where(x => x.ApiKeyId == apiKeyId && x.RequestedAt >= from && x.RequestedAt <= to)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(e => new ApiUsageLog
        {
            Id = e.Id,
            TenantId = e.TenantId,
            ApiKeyId = e.ApiKeyId,
            ServiceAccountId = e.ServiceAccountId,
            Endpoint = e.Endpoint,
            HttpMethod = e.HttpMethod,
            StatusCode = e.StatusCode,
            ResponseTimeMs = e.ResponseTimeMs,
            IpAddress = e.IpAddress,
            UserAgent = e.UserAgent,
            RequestedAt = e.RequestedAt
        }).ToList();
    }

    public async Task<int> GetUsageCountAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<ApiUsageLogEntity>()
            .CountAsync(x => x.TenantId == tenantId && x.RequestedAt >= from && x.RequestedAt <= to, cancellationToken);
    }
}
