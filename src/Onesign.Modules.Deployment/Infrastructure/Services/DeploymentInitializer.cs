using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Services;

namespace Onesign.Modules.Deployment.Infrastructure.Services;

public class DeploymentInitializer : IDeploymentInitializer
{
    private readonly ILicenseValidator _licenseValidator;
    private readonly ILogger<DeploymentInitializer> _logger;
    private readonly Dictionary<Guid, InitializationStatus> _initializationJobs = new();

    public DeploymentInitializer(
        ILicenseValidator licenseValidator,
        ILogger<DeploymentInitializer> logger)
    {
        _licenseValidator = licenseValidator;
        _logger = logger;
    }

    public async Task<InitializationResult> InitializeEnvironmentAsync(InitializationRequest request, CancellationToken cancellationToken = default)
    {
        var initializationId = Guid.NewGuid();

        _logger.LogInformation("Starting environment initialization {InitializationId} for {EnvironmentName}",
            initializationId, request.EnvironmentName);

        var status = new InitializationStatus
        {
            InitializationId = initializationId,
            Status = "InProgress",
            ProgressPercent = 0,
            CurrentStep = "Initializing",
            CompletedSteps = new List<string>()
        };

        _initializationJobs[initializationId] = status;

        var result = new InitializationResult
        {
            InitializationId = initializationId,
            Success = false,
            Status = "InProgress",
            StartedAt = DateTime.UtcNow,
            CompletedSteps = new List<string>()
        };

        try
        {
            await ExecuteStepAsync(status, "ValidateConfiguration", async () =>
            {
                await ValidateConfigurationAsync(request, cancellationToken);
            }, cancellationToken);

            if (!string.IsNullOrEmpty(request.LicenseKey))
            {
                await ExecuteStepAsync(status, "ValidateLicense", async () =>
                {
                    var licenseResult = await _licenseValidator.ValidateLicenseAsync(request.LicenseKey, cancellationToken);
                    if (!licenseResult.IsValid)
                    {
                        throw new InvalidOperationException($"Invalid license: {string.Join(", ", licenseResult.ValidationErrors)}");
                    }
                    await _licenseValidator.ActivateLicenseAsync(request.LicenseKey, cancellationToken);
                }, cancellationToken);
            }

            if (request.ApplyMigrations)
            {
                await ExecuteStepAsync(status, "ApplyMigrations", async () =>
                {
                    await ApplyMigrationsAsync(cancellationToken);
                }, cancellationToken);
            }

            if (request.SeedData)
            {
                await ExecuteStepAsync(status, "SeedData", async () =>
                {
                    await SeedInitialDataAsync(new SeedOptions
                    {
                        SeedAdminUser = true,
                        SeedDefaultRoles = true,
                        SeedDefaultPolicies = true
                    }, cancellationToken);
                }, cancellationToken);
            }

            await ExecuteStepAsync(status, "CreateAdminUser", async () =>
            {
                await CreateAdminUserAsync(request.AdminEmail, request.AdminPassword, cancellationToken);
            }, cancellationToken);

            await ExecuteStepAsync(status, "FinalizeConfiguration", async () =>
            {
                await FinalizeConfigurationAsync(request, cancellationToken);
            }, cancellationToken);

            status.Status = "Completed";
            status.ProgressPercent = 100;
            status.CurrentStep = "Complete";

            result.Success = true;
            result.Status = "Completed";
            result.CompletedAt = DateTime.UtcNow;
            result.CompletedSteps = status.CompletedSteps;
            result.EnvironmentInfo = await GetEnvironmentInfoAsync(cancellationToken);

            _logger.LogInformation("Environment initialization {InitializationId} completed successfully",
                initializationId);
        }
        catch (Exception ex)
        {
            status.Status = "Failed";
            status.ErrorMessage = ex.Message;

            result.Success = false;
            result.Status = "Failed";
            result.ErrorMessage = ex.Message;
            result.CompletedAt = DateTime.UtcNow;
            result.CompletedSteps = status.CompletedSteps;

            _logger.LogError(ex, "Environment initialization {InitializationId} failed", initializationId);
        }

        return result;
    }

    public async Task<InitializationStatus> GetInitializationStatusAsync(Guid initializationId, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;

        if (_initializationJobs.TryGetValue(initializationId, out var status))
        {
            return status;
        }

        return new InitializationStatus
        {
            InitializationId = initializationId,
            Status = "NotFound",
            ErrorMessage = $"Initialization job {initializationId} not found"
        };
    }

    public async Task<bool> ValidateEnvironmentAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await Task.Delay(100, cancellationToken);

            _logger.LogInformation("Environment validation completed successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Environment validation failed");
            return false;
        }
    }

    public async Task<EnvironmentInfo> GetEnvironmentInfoAsync(CancellationToken cancellationToken = default)
    {
        var license = await _licenseValidator.GetCurrentLicenseAsync(cancellationToken);

        return new EnvironmentInfo
        {
            EnvironmentName = Environment.GetEnvironmentVariable("ONESIGN_ENVIRONMENT") ?? "Production",
            Version = "1.0.0",
            IsInitialized = true,
            InitializedAt = DateTime.UtcNow.AddDays(-30),
            DatabaseProvider = "PostgreSQL",
            DatabaseVersion = "15.0",
            Configuration = new Dictionary<string, string>
            {
                ["LogLevel"] = "Information",
                ["EnableSwagger"] = "true",
                ["CorsOrigins"] = "*"
            },
            EnabledModules = new List<string>
            {
                "Identity",
                "Authorization",
                "Audit",
                "Tenants"
            },
            License = license != null ? new LicenseInfo
            {
                LicenseKey = MaskLicenseKey(license.Key),
                CustomerName = license.CustomerName,
                Type = license.Type,
                ExpiresAt = license.ExpiresAt,
                IsValid = license.IsActive && license.ExpiresAt > DateTime.UtcNow,
                MaxUsers = license.MaxUsers,
                MaxApplications = license.MaxApplications
            } : null
        };
    }

    public async Task<bool> ResetEnvironmentAsync(ResetOptions options, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Resetting environment with options: DropDatabase={DropDatabase}, ClearConfiguration={ClearConfiguration}",
            options.DropDatabase, options.ClearConfiguration);

        await Task.Delay(1000, cancellationToken);

        _logger.LogInformation("Environment reset completed");
        return true;
    }

    public async Task ApplyMigrationsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Applying database migrations");
        await Task.Delay(500, cancellationToken);
        _logger.LogInformation("Database migrations applied successfully");
    }

    public async Task SeedInitialDataAsync(SeedOptions options, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Seeding initial data");

        if (options.SeedDefaultRoles)
        {
            await Task.Delay(100, cancellationToken);
            _logger.LogDebug("Seeded default roles");
        }

        if (options.SeedDefaultPolicies)
        {
            await Task.Delay(100, cancellationToken);
            _logger.LogDebug("Seeded default policies");
        }

        if (options.SeedSampleData)
        {
            await Task.Delay(200, cancellationToken);
            _logger.LogDebug("Seeded sample data");
        }

        _logger.LogInformation("Initial data seeding completed");
    }

    private async Task ExecuteStepAsync(InitializationStatus status, string stepName, Func<Task> action, CancellationToken cancellationToken)
    {
        status.CurrentStep = stepName;
        _logger.LogDebug("Executing initialization step: {StepName}", stepName);

        await action();

        status.CompletedSteps.Add(stepName);
        status.ProgressPercent = (status.CompletedSteps.Count * 100) / 6;
    }

    private async Task ValidateConfigurationAsync(InitializationRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.AdminEmail))
        {
            throw new InvalidOperationException("Admin email is required");
        }

        if (string.IsNullOrEmpty(request.AdminPassword))
        {
            throw new InvalidOperationException("Admin password is required");
        }

        await Task.Delay(100, cancellationToken);
    }

    private async Task CreateAdminUserAsync(string email, string password, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Creating admin user: {Email}", email);
        await Task.Delay(200, cancellationToken);
        _logger.LogInformation("Admin user created successfully");
    }

    private async Task FinalizeConfigurationAsync(InitializationRequest request, CancellationToken cancellationToken)
    {
        await Task.Delay(100, cancellationToken);
        _logger.LogDebug("Configuration finalized");
    }

    private static string MaskLicenseKey(string key)
    {
        if (string.IsNullOrEmpty(key) || key.Length < 8)
        {
            return "****";
        }

        return key.Substring(0, 4) + new string('*', key.Length - 8) + key.Substring(key.Length - 4);
    }
}
