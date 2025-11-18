namespace Onesign.Modules.Billing.Domain.Services;

public interface IQuotaEnforcementService
{
    Task CheckCanCreateUserAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task CheckCanCreateApplicationAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task CheckCanCreateIdpAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task CheckCanCreateOrgUnitAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task CheckFeatureEnabledAsync(Guid tenantId, string featureKey, CancellationToken cancellationToken = default);
}
