using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.Services;

public class LifecyclePolicyEvaluatorService : ILifecyclePolicyEvaluator
{
    private readonly ILifecyclePolicyRepository _policyRepository;
    private readonly IAccessPackageRepository _packageRepository;
    private readonly ILogger<LifecyclePolicyEvaluatorService> _logger;

    public LifecyclePolicyEvaluatorService(
        ILifecyclePolicyRepository policyRepository,
        IAccessPackageRepository packageRepository,
        ILogger<LifecyclePolicyEvaluatorService> logger)
    {
        _policyRepository = policyRepository;
        _packageRepository = packageRepository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<AccessPackage>> EvaluatePoliciesForUserAsync(
        Guid tenantId,
        HRIdentityRecord hrRecord,
        CancellationToken cancellationToken = default)
    {
        var matchingPolicies = await GetMatchingPoliciesAsync(
            tenantId,
            hrRecord.OrgUnitCode,
            hrRecord.JobRole,
            hrRecord.Location,
            hrRecord.EmploymentType,
            cancellationToken);

        if (!matchingPolicies.Any())
        {
            _logger.LogInformation("No matching policies found for HR record {HRRecordId}", hrRecord.Id);
            return Array.Empty<AccessPackage>();
        }

        var packages = await GetAccessPackagesFromPoliciesAsync(matchingPolicies, cancellationToken);
        _logger.LogInformation(
            "Found {PackageCount} access packages from {PolicyCount} matching policies for HR record {HRRecordId}",
            packages.Count, matchingPolicies.Count, hrRecord.Id);

        return packages;
    }

    public async Task<IReadOnlyList<LifecyclePolicy>> GetMatchingPoliciesAsync(
        Guid tenantId,
        string? orgUnitCode,
        string? jobRole,
        string? location,
        string? employmentType,
        CancellationToken cancellationToken = default)
    {
        var allPolicies = await _policyRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        var matchingPolicies = allPolicies
            .Where(p => p.IsEnabled)
            .Where(p =>
                (string.IsNullOrEmpty(p.OrgUnitCode) || p.OrgUnitCode == orgUnitCode) &&
                (string.IsNullOrEmpty(p.JobRole) || p.JobRole == jobRole) &&
                (string.IsNullOrEmpty(p.Location) || p.Location == location) &&
                (string.IsNullOrEmpty(p.EmploymentType) || p.EmploymentType == employmentType))
            .ToList();

        return matchingPolicies;
    }

    public async Task<IReadOnlyList<AccessPackage>> GetAccessPackagesFromPoliciesAsync(
        IEnumerable<LifecyclePolicy> policies,
        CancellationToken cancellationToken = default)
    {
        var packageIds = policies
            .SelectMany(p => JsonSerializer.Deserialize<List<Guid>>(p.AccessPackageIdsJson) ?? new())
            .Distinct()
            .ToList();

        var packages = new List<AccessPackage>();
        foreach (var packageId in packageIds)
        {
            var package = await _packageRepository.GetByIdAsync(packageId, cancellationToken);
            if (package != null && package.IsEnabled)
            {
                packages.Add(package);
            }
        }

        return packages;
    }
}
