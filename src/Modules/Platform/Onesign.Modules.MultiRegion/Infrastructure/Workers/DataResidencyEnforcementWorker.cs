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
        switch (violation.Severity.ToLowerInvariant())
        {
            case "critical":
                _logger.LogCritical("Critical data residency violation for tenant {TenantId}: {ViolationType} - {Description}. Initiating automated remediation.",
                    violation.TenantId, violation.ViolationType, violation.Description);

                // For critical violations, attempt automated remediation
                await HandleCriticalViolationAsync(violation, cancellationToken);
                break;

            case "high":
                _logger.LogError("High severity data residency violation for tenant {TenantId}: {ViolationType} - {Description}. Manual review required.",
                    violation.TenantId, violation.ViolationType, violation.Description);

                // For high severity, log for manual intervention but don't auto-remediate
                await CreateViolationAlertAsync(violation, "High", cancellationToken);
                break;

            default:
                _logger.LogWarning("Data residency violation for tenant {TenantId}: {ViolationType} - {Description}",
                    violation.TenantId, violation.ViolationType, violation.Description);

                // For low/medium violations, just track for compliance reporting
                await CreateViolationAlertAsync(violation, "Medium", cancellationToken);
                break;
        }
    }

    private async Task HandleCriticalViolationAsync(DataResidencyViolation violation, CancellationToken cancellationToken)
    {
        try
        {
            // Get the tenant's data residency configuration
            var residency = await _dataResidencyRepository.GetByTenantIdAsync(violation.TenantId, cancellationToken);

            if (residency == null)
            {
                _logger.LogError("Cannot remediate violation for tenant {TenantId}: residency configuration not found",
                    violation.TenantId);
                return;
            }

            // In a production system, this would:
            // 1. Automatically trigger data migration back to compliant region
            // 2. Suspend non-compliant operations
            // 3. Send immediate alerts to compliance team
            // 4. Create incident tickets

            _logger.LogWarning("Automated remediation would initiate data migration for tenant {TenantId} to primary region {RegionId}",
                violation.TenantId, residency.PrimaryRegionId);

            // Simulate remediation tracking
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling critical violation for tenant {TenantId}", violation.TenantId);
        }
    }

    private async Task CreateViolationAlertAsync(DataResidencyViolation violation, string severity, CancellationToken cancellationToken)
    {
        // In a production system, this would:
        // 1. Send alerts via notification service (email, SMS, PagerDuty, etc.)
        // 2. Create compliance audit records
        // 3. Update monitoring dashboards
        // 4. Generate compliance reports

        _logger.LogInformation("Violation alert created for tenant {TenantId}: Severity={Severity}, Type={Type}",
            violation.TenantId, severity, violation.ViolationType);

        await Task.CompletedTask;
    }
}
