using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Domain.Services;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Application.Services;

public class QuotaEnforcementService : IQuotaEnforcementService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly DbContext _dbContext;

    public QuotaEnforcementService(
        ISubscriptionRepository subscriptionRepository,
        DbContext dbContext)
    {
        _subscriptionRepository = subscriptionRepository;
        _dbContext = dbContext;
    }

    public async Task CheckCanCreateUserAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (subscription?.Plan == null)
        {
            throw new InvalidOperationException("Tenant does not have an active subscription");
        }

        var maxUsers = GetIntFeature(subscription.Plan, "MaxUsers");
        if (!maxUsers.HasValue) return; // No limit

        var limitType = GetLimitType(subscription.Plan, "MaxUsers");

        var currentCount = await _dbContext.Set<TenantUserEntity>()
            .CountAsync(x => x.TenantId == tenantId, cancellationToken);

        if (currentCount >= maxUsers.Value && limitType == Domain.Enums.LimitType.Hard)
        {
            throw new QuotaExceededException("USER_QUOTA_EXCEEDED",
                $"Maximum user limit ({maxUsers.Value}) has been reached for this plan");
        }
    }

    public async Task CheckCanCreateApplicationAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (subscription?.Plan == null)
        {
            throw new InvalidOperationException("Tenant does not have an active subscription");
        }

        var maxApps = GetIntFeature(subscription.Plan, "MaxApplications");
        if (!maxApps.HasValue) return; // No limit

        var limitType = GetLimitType(subscription.Plan, "MaxApplications");

        var currentCount = await _dbContext.Set<ApplicationClientEntity>()
            .CountAsync(x => x.TenantId == tenantId, cancellationToken);

        if (currentCount >= maxApps.Value && limitType == Domain.Enums.LimitType.Hard)
        {
            throw new QuotaExceededException("APPLICATION_QUOTA_EXCEEDED",
                $"Maximum application limit ({maxApps.Value}) has been reached for this plan");
        }
    }

    public async Task CheckCanCreateIdpAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (subscription?.Plan == null)
        {
            throw new InvalidOperationException("Tenant does not have an active subscription");
        }

        var maxIdps = GetIntFeature(subscription.Plan, "MaxIdpConnections");
        if (!maxIdps.HasValue) return; // No limit

        var limitType = GetLimitType(subscription.Plan, "MaxIdpConnections");

        var samlCount = await _dbContext.Set<SamlProviderEntity>()
            .CountAsync(x => x.TenantId == tenantId, cancellationToken);

        var oidcCount = await _dbContext.Set<OidcFederationProviderEntity>()
            .CountAsync(x => x.TenantId == tenantId, cancellationToken);

        var currentCount = samlCount + oidcCount;

        if (currentCount >= maxIdps.Value && limitType == Domain.Enums.LimitType.Hard)
        {
            throw new QuotaExceededException("IDP_QUOTA_EXCEEDED",
                $"Maximum IdP connection limit ({maxIdps.Value}) has been reached for this plan");
        }
    }

    public async Task CheckCanCreateOrgUnitAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (subscription?.Plan == null)
        {
            throw new InvalidOperationException("Tenant does not have an active subscription");
        }

        var maxOrgUnits = GetIntFeature(subscription.Plan, "MaxOrgUnits");
        if (!maxOrgUnits.HasValue) return; // No limit

        var limitType = GetLimitType(subscription.Plan, "MaxOrgUnits");

        var currentCount = await _dbContext.Set<OrgUnitEntity>()
            .CountAsync(x => x.TenantId == tenantId, cancellationToken);

        if (currentCount >= maxOrgUnits.Value && limitType == Domain.Enums.LimitType.Hard)
        {
            throw new QuotaExceededException("ORGUNIT_QUOTA_EXCEEDED",
                $"Maximum organizational unit limit ({maxOrgUnits.Value}) has been reached for this plan");
        }
    }

    public async Task CheckFeatureEnabledAsync(Guid tenantId, string featureKey, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (subscription?.Plan == null)
        {
            throw new InvalidOperationException("Tenant does not have an active subscription");
        }

        var feature = subscription.Plan.Features.FirstOrDefault(f => f.Key == featureKey);
        if (feature == null)
        {
            throw new FeatureNotAvailableException("FEATURE_NOT_AVAILABLE",
                $"Feature '{featureKey}' is not available in the current plan");
        }

        // Check if it's a boolean feature
        if (bool.TryParse(feature.Value, out var isEnabled) && !isEnabled)
        {
            throw new FeatureNotAvailableException("FEATURE_DISABLED",
                $"Feature '{featureKey}' is not enabled in the current plan");
        }
    }

    private static int? GetIntFeature(Domain.Entities.Plan plan, string key)
    {
        var feature = plan.Features.FirstOrDefault(f => f.Key == key);
        if (feature == null) return null;
        return int.TryParse(feature.Value, out var value) ? value : null;
    }

    private static Domain.Enums.LimitType GetLimitType(Domain.Entities.Plan plan, string key)
    {
        var feature = plan.Features.FirstOrDefault(f => f.Key == key);
        return feature?.LimitType ?? Domain.Enums.LimitType.Hard; // Default to Hard if not specified
    }
}

public class QuotaExceededException : Exception
{
    public string ErrorCode { get; }

    public QuotaExceededException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
}

public class FeatureNotAvailableException : Exception
{
    public string ErrorCode { get; }

    public FeatureNotAvailableException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
}
