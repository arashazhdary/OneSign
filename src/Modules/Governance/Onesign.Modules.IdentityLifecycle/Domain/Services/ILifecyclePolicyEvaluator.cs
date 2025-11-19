using Onesign.Modules.IdentityLifecycle.Domain.Entities;

namespace Onesign.Modules.IdentityLifecycle.Domain.Services;

public interface ILifecyclePolicyEvaluator
{
    Task<IReadOnlyList<AccessPackage>> EvaluatePoliciesForUserAsync(
        Guid tenantId,
        HRIdentityRecord hrRecord,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LifecyclePolicy>> GetMatchingPoliciesAsync(
        Guid tenantId,
        string? orgUnitCode,
        string? jobRole,
        string? location,
        string? employmentType,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AccessPackage>> GetAccessPackagesFromPoliciesAsync(
        IEnumerable<LifecyclePolicy> policies,
        CancellationToken cancellationToken = default);
}
