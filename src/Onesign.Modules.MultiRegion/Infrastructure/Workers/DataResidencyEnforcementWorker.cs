using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Workers;

public class DataResidencyEnforcementWorker : BackgroundService
{
    private readonly ITenantDataResidencyService _dataResidencyService;
    private readonly ITenantDataResidencyRepository _dataResidencyRepository;
    private readonly ILogger<DataResidencyEnforcementWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(15);

    public DataResidencyEnforcementWorker(
        ITenantDataResidencyService dataResidencyService,
        ITenantDataResidencyRepository dataResidencyRepository,
        ILogger<DataResidencyEnforcementWorker> logger)
    {
        _dataResidencyService = dataResidencyService;
        _dataResidencyRepository = dataResidencyRepository;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataResidencyEnforcementWorker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await EnforceDataResidencyPoliciesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enforcing data residency policies");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("DataResidencyEnforcementWorker stopped");
    }

    private async Task EnforceDataResidencyPoliciesAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Starting data residency enforcement check");

        var tenantResidencies = await GetAllTenantResidenciesAsync(cancellationToken);
        var violationCount = 0;

        foreach (var residency in tenantResidencies)
        {
            try
            {
                var isCompliant = await _dataResidencyService.ValidateDataResidencyComplianceAsync(
                    residency.TenantId, cancellationToken);

                if (!isCompliant)
                {
                    violationCount++;

                    var violations = await _dataResidencyService.GetDataResidencyViolationsAsync(
                        residency.TenantId, cancellationToken);

                    foreach (var violation in violations)
                    {
                        _logger.LogWarning("Data residency violation detected for tenant {TenantId}: {ViolationType} - {Description}",
                            residency.TenantId, violation.ViolationType, violation.Description);

                        await HandleViolationAsync(violation, cancellationToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking data residency compliance for tenant {TenantId}",
                    residency.TenantId);
            }
        }

        if (violationCount > 0)
        {
            _logger.LogWarning("Data residency enforcement check completed: {ViolationCount} violations found",
                violationCount);
        }
        else
        {
            _logger.LogDebug("Data residency enforcement check completed: no violations found");
        }
    }

    private async Task<IEnumerable<Domain.Entities.TenantDataResidency>> GetAllTenantResidenciesAsync(CancellationToken cancellationToken)
    {
        var regions = new[] { "us-east-1", "eu-west-1", "ap-southeast-1" };
        var allResidencies = new List<Domain.Entities.TenantDataResidency>();

        foreach (var regionId in regions)
        {
            var residencies = await _dataResidencyRepository.GetByRegionIdAsync(regionId, cancellationToken);
            allResidencies.AddRange(residencies);
        }

        return allResidencies;
    }

    private async Task HandleViolationAsync(DataResidencyViolation violation, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        switch (violation.Severity.ToLowerInvariant())
        {
            case "critical":
                _logger.LogCritical("Critical data residency violation for tenant {TenantId}: {Description}. Immediate action required.",
                    violation.TenantId, violation.Description);
                break;
            case "high":
                _logger.LogError("High severity data residency violation for tenant {TenantId}: {Description}",
                    violation.TenantId, violation.Description);
                break;
            default:
                _logger.LogWarning("Data residency violation for tenant {TenantId}: {Description}",
                    violation.TenantId, violation.Description);
                break;
        }
    }
}
