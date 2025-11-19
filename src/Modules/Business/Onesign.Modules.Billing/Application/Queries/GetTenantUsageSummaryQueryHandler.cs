using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;
using Onesign.Modules.OrgHierarchy.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetTenantUsageSummaryQueryHandler : IRequestHandler<GetTenantUsageSummaryQuery, Result<TenantUsageSummaryDto>>
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUsageRepository _usageRepository;
    private readonly DbContext _dbContext;

    public GetTenantUsageSummaryQueryHandler(
        ISubscriptionRepository subscriptionRepository,
        IUsageRepository usageRepository,
        DbContext dbContext)
    {
        _subscriptionRepository = subscriptionRepository;
        _usageRepository = usageRepository;
        _dbContext = dbContext;
    }

    public async Task<Result<TenantUsageSummaryDto>> Handle(GetTenantUsageSummaryQuery request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (subscription == null)
        {
            return Result.Failure<TenantUsageSummaryDto>("SUBSCRIPTION_NOT_FOUND", "Tenant does not have a subscription");
        }

        // Get current counts from database
        var userCount = await _dbContext.Set<TenantUserEntity>()
            .CountAsync(x => x.TenantId == request.TenantId, cancellationToken);

        var appCount = await _dbContext.Set<ApplicationClientEntity>()
            .CountAsync(x => x.TenantId == request.TenantId, cancellationToken);

        var idpCount = await _dbContext.Set<SamlProviderEntity>()
            .CountAsync(x => x.TenantId == request.TenantId, cancellationToken);

        idpCount += await _dbContext.Set<OidcFederationProviderEntity>()
            .CountAsync(x => x.TenantId == request.TenantId, cancellationToken);

        var orgUnitCount = await _dbContext.Set<OrgUnitEntity>()
            .CountAsync(x => x.TenantId == request.TenantId, cancellationToken);

        // Get usage counters for current month
        var now = DateTime.UtcNow;
        var loginsCounter = await _usageRepository.GetCounterAsync(
            request.TenantId, UsageMetricType.Logins, now.Year, now.Month, cancellationToken);
        var scimCounter = await _usageRepository.GetCounterAsync(
            request.TenantId, UsageMetricType.ScimCalls, now.Year, now.Month, cancellationToken);

        // Extract limits from plan features
        var plan = subscription.Plan;
        int? maxUsers = GetIntFeature(plan, "MaxUsers");
        int? maxApps = GetIntFeature(plan, "MaxApplications");
        int? maxIdps = GetIntFeature(plan, "MaxIdpConnections");
        int? maxOrgUnits = GetIntFeature(plan, "MaxOrgUnits");
        long? maxLogins = GetLongFeature(plan, "MaxLoginsPerMonth");

        var dto = new TenantUsageSummaryDto
        {
            TenantId = request.TenantId,
            TenantName = "", // Would need to query tenant name from Admin module
            Subscription = new TenantSubscriptionDto
            {
                Id = subscription.Id,
                TenantId = subscription.TenantId,
                PlanId = subscription.PlanId,
                PlanName = plan?.Name,
                PlanType = plan?.Type,
                Status = subscription.Status,
                StartedAt = subscription.StartedAt,
                TrialEndsAt = subscription.TrialEndsAt,
                CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt,
                IsTrial = subscription.IsTrial
            },
            UserCount = userCount,
            ApplicationCount = appCount,
            IdpConnectionCount = idpCount,
            OrgUnitCount = orgUnitCount,
            LoginsThisMonth = loginsCounter?.Value ?? 0,
            ScimCallsThisMonth = scimCounter?.Value ?? 0,
            MaxUsers = maxUsers,
            MaxApplications = maxApps,
            MaxIdpConnections = maxIdps,
            MaxOrgUnits = maxOrgUnits,
            MaxLoginsPerMonth = maxLogins,
            QuotaStatus = BuildQuotaStatus(request.TenantId, userCount, appCount, idpCount,
                loginsCounter?.Value ?? 0, maxUsers, maxApps, maxIdps, maxLogins),
            LastUpdated = DateTime.UtcNow
        };

        return Result.Success(dto);
    }

    private static int? GetIntFeature(Domain.Entities.Plan? plan, string key)
    {
        var feature = plan?.Features.FirstOrDefault(f => f.Key == key);
        if (feature == null) return null;
        return int.TryParse(feature.Value, out var value) ? value : null;
    }

    private static long? GetLongFeature(Domain.Entities.Plan? plan, string key)
    {
        var feature = plan?.Features.FirstOrDefault(f => f.Key == key);
        if (feature == null) return null;
        return long.TryParse(feature.Value, out var value) ? value : null;
    }

    private static TenantQuotaStatusDto BuildQuotaStatus(
        Guid tenantId, int userCount, int appCount, int idpCount, long logins,
        int? maxUsers, int? maxApps, int? maxIdps, long? maxLogins)
    {
        const double nearLimitThreshold = 0.8; // 80%

        return new TenantQuotaStatusDto
        {
            TenantId = tenantId,
            UserCount = userCount,
            MaxUsers = maxUsers,
            UserUsagePercent = maxUsers.HasValue && maxUsers.Value > 0 ? (double)userCount / maxUsers.Value * 100 : null,
            IsNearUserLimit = maxUsers.HasValue && userCount >= maxUsers.Value * nearLimitThreshold,
            IsOverUserLimit = maxUsers.HasValue && userCount >= maxUsers.Value,

            ApplicationCount = appCount,
            MaxApplications = maxApps,
            ApplicationUsagePercent = maxApps.HasValue && maxApps.Value > 0 ? (double)appCount / maxApps.Value * 100 : null,
            IsNearApplicationLimit = maxApps.HasValue && appCount >= maxApps.Value * nearLimitThreshold,
            IsOverApplicationLimit = maxApps.HasValue && appCount >= maxApps.Value,

            IdpConnectionCount = idpCount,
            MaxIdpConnections = maxIdps,
            IdpUsagePercent = maxIdps.HasValue && maxIdps.Value > 0 ? (double)idpCount / maxIdps.Value * 100 : null,
            IsNearIdpLimit = maxIdps.HasValue && idpCount >= maxIdps.Value * nearLimitThreshold,
            IsOverIdpLimit = maxIdps.HasValue && idpCount >= maxIdps.Value,

            LoginsThisMonth = logins,
            MaxLoginsPerMonth = maxLogins,
            LoginUsagePercent = maxLogins.HasValue && maxLogins.Value > 0 ? (double)logins / maxLogins.Value * 100 : null,
            IsNearLoginLimit = maxLogins.HasValue && logins >= maxLogins.Value * nearLimitThreshold,
            IsOverLoginLimit = maxLogins.HasValue && logins >= maxLogins.Value
        };
    }
}
