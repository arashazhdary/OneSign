using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that sends heartbeats for deployment environments,
/// updating LastHeartbeatAt to indicate system health.
/// </summary>
public class HealthCheckWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HealthCheckWorker> _logger;
    private readonly IConfiguration _configuration;

    public HealthCheckWorker(
        IServiceProvider serviceProvider,
        ILogger<HealthCheckWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:HealthCheck:IntervalMinutes", 5);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);

        _logger.LogInformation("HealthCheckWorker starting with interval of {Interval} minutes", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendHeartbeatsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in HealthCheckWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task SendHeartbeatsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get current environment ID from configuration
        var environmentId = _configuration.GetValue("Environment:Id", "default");

        // Find the deployment environment
        var environment = await dbContext.DeploymentEnvironments
            .FirstOrDefaultAsync(e => e.Id == environmentId, cancellationToken);

        if (environment == null)
        {
            // Create a new environment record if it doesn't exist
            environment = new Onesign.Modules.Deployment.Infrastructure.EfCore.Entities.DeploymentEnvironmentEntity
            {
                Id = environmentId,
                Name = _configuration.GetValue("Environment:Name", "Default Environment"),
                Type = GetEnvironmentType(_configuration.GetValue("Environment:Type", "Development")),
                RegionId = _configuration.GetValue("Environment:RegionId", "default"),
                BaseUrl = _configuration.GetValue("Environment:BaseUrl", "http://localhost:5000"),
                AppVersion = GetApplicationVersion(),
                DbSchemaVersion = GetDbSchemaVersion(),
                LicenseKey = _configuration.GetValue("Environment:LicenseKey", ""),
                CreatedAt = DateTime.UtcNow,
                LastHeartbeatAt = DateTime.UtcNow
            };

            dbContext.DeploymentEnvironments.Add(environment);
            _logger.LogInformation("Created new deployment environment record: {EnvironmentId}", environmentId);
        }
        else
        {
            // Update heartbeat timestamp
            environment.LastHeartbeatAt = DateTime.UtcNow;
            environment.AppVersion = GetApplicationVersion();

            _logger.LogDebug("Heartbeat sent for environment {EnvironmentId}", environmentId);
        }

        // Check for stale environments (no heartbeat in 15 minutes)
        var staleThreshold = DateTime.UtcNow.AddMinutes(-15);
        var staleEnvironments = await dbContext.DeploymentEnvironments
            .Where(e => e.LastHeartbeatAt < staleThreshold && e.Id != environmentId)
            .ToListAsync(cancellationToken);

        if (staleEnvironments.Any())
        {
            _logger.LogWarning(
                "Found {Count} stale deployment environments with no heartbeat in 15 minutes",
                staleEnvironments.Count);

            foreach (var stale in staleEnvironments)
            {
                _logger.LogWarning(
                    "Environment {EnvironmentId} ({Name}) last heartbeat: {LastHeartbeat}",
                    stale.Id, stale.Name, stale.LastHeartbeatAt);
            }
        }

        // Perform basic health checks
        await PerformHealthChecksAsync(dbContext, environment, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task PerformHealthChecksAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Deployment.Infrastructure.EfCore.Entities.DeploymentEnvironmentEntity environment,
        CancellationToken cancellationToken)
    {
        var healthChecks = new List<(string Name, bool Passed, string Message)>();

        // Database connectivity check
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
            healthChecks.Add(("Database", canConnect, canConnect ? "Connected" : "Connection failed"));
        }
        catch (Exception ex)
        {
            healthChecks.Add(("Database", false, ex.Message));
        }

        // Check for pending migrations
        try
        {
            var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(cancellationToken);
            var hasPending = pendingMigrations.Any();
            healthChecks.Add(("Migrations", !hasPending,
                hasPending ? $"Pending: {string.Join(", ", pendingMigrations)}" : "Up to date"));
        }
        catch (Exception ex)
        {
            healthChecks.Add(("Migrations", false, ex.Message));
        }

        // Memory check
        var memoryUsedMb = GC.GetTotalMemory(false) / 1024 / 1024;
        var memoryThresholdMb = _configuration.GetValue("BackgroundServices:HealthCheck:MemoryThresholdMb", 1000);
        healthChecks.Add(("Memory", memoryUsedMb < memoryThresholdMb,
            $"Used: {memoryUsedMb} MB (threshold: {memoryThresholdMb} MB)"));

        // Log health check results
        var failedChecks = healthChecks.Where(c => !c.Passed).ToList();
        if (failedChecks.Any())
        {
            foreach (var check in failedChecks)
            {
                _logger.LogWarning("Health check failed - {Name}: {Message}", check.Name, check.Message);
            }
        }
        else
        {
            _logger.LogDebug("All health checks passed for environment {EnvironmentId}", environment.Id);
        }
    }

    private static int GetEnvironmentType(string type) => type.ToLowerInvariant() switch
    {
        "production" => 0,
        "staging" => 1,
        "development" => 2,
        "testing" => 3,
        _ => 2 // Default to Development
    };

    private static string GetApplicationVersion()
    {
        var assembly = typeof(HealthCheckWorker).Assembly;
        var version = assembly.GetName().Version;
        return version?.ToString() ?? "1.0.0";
    }

    private static string GetDbSchemaVersion()
    {
        // In a real implementation, this would be read from migrations
        return "2024.11.1";
    }
}
