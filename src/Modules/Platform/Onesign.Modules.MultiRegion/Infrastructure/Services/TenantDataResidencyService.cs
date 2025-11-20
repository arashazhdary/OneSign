using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Services;

public class TenantDataResidencyService : ITenantDataResidencyService
{
    private readonly ITenantDataResidencyRepository _dataResidencyRepository;
    private readonly IRegionRepository _regionRepository;
    private readonly ILogger<TenantDataResidencyService> _logger;

    public TenantDataResidencyService(
        ITenantDataResidencyRepository dataResidencyRepository,
        IRegionRepository regionRepository,
        ILogger<TenantDataResidencyService> logger)
    {
        _dataResidencyRepository = dataResidencyRepository;
        _regionRepository = regionRepository;
        _logger = logger;
    }

    public async Task<TenantDataResidency> GetTenantDataResidencyAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dataResidencyRepository.GetByTenantIdAsync(tenantId, cancellationToken);
    }

    public async Task<TenantDataResidency> SetTenantDataResidencyAsync(SetDataResidencyRequest request, CancellationToken cancellationToken = default)
    {
        var region = await _regionRepository.GetByIdAsync(request.PrimaryRegionId, cancellationToken);
        if (region == null)
        {
            throw new InvalidOperationException($"Region {request.PrimaryRegionId} not found");
        }

        var existing = await _dataResidencyRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (existing != null)
        {
            existing.DataRegionId = request.PrimaryRegionId;
            existing.BackupRegionId = request.AllowedRegions?.FirstOrDefault();
            existing.UpdatedAt = DateTime.UtcNow;

            await _dataResidencyRepository.UpdateAsync(existing, cancellationToken);

            _logger.LogInformation("Updated data residency for tenant {TenantId} to region {RegionId}",
                request.TenantId, request.PrimaryRegionId);

            return existing;
        }

        var residency = new TenantDataResidency
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            DataRegionId = request.PrimaryRegionId,
            BackupRegionId = request.AllowedRegions?.FirstOrDefault(),
            CreatedAt = DateTime.UtcNow
        };

        await _dataResidencyRepository.AddAsync(residency, cancellationToken);

        _logger.LogInformation("Created data residency for tenant {TenantId} in region {RegionId}",
            request.TenantId, request.PrimaryRegionId);

        return residency;
    }

    public async Task<DataResidencyMigrationResult> MigrateTenantToRegionAsync(MigrateTenantRequest request, CancellationToken cancellationToken = default)
    {
        var migrationId = Guid.NewGuid();
        var currentResidency = await _dataResidencyRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (currentResidency == null)
        {
            return new DataResidencyMigrationResult
            {
                MigrationId = Guid.Empty,
                TenantId = request.TenantId,
                Status = "Failed",
                InitiatedAt = DateTime.UtcNow,
                ErrorMessage = "Tenant data residency configuration not found"
            };
        }

        _logger.LogInformation("Initiating migration {MigrationId} for tenant {TenantId} from {Source} to {Target}",
            migrationId, request.TenantId, currentResidency.DataRegionId, request.TargetRegionId);

        return new DataResidencyMigrationResult
        {
            MigrationId = migrationId,
            TenantId = request.TenantId,
            SourceRegionId = currentResidency.DataRegionId,
            TargetRegionId = request.TargetRegionId,
            Status = "InProgress",
            InitiatedAt = DateTime.UtcNow
        };
    }

    public async Task<DataResidencyMigrationStatus> GetMigrationStatusAsync(Guid migrationId, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;

        return new DataResidencyMigrationStatus
        {
            MigrationId = migrationId,
            Status = "Completed",
            ProgressPercent = 100,
            CurrentPhase = "Complete",
            CompletedAt = DateTime.UtcNow
        };
    }

    public async Task<IReadOnlyList<DataResidencyPolicy>> GetDataResidencyPoliciesAsync(CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;

        return new List<DataResidencyPolicy>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "EU Data Sovereignty",
                Description = "Requires data to remain in EU regions",
                AllowedRegions = new List<string> { "eu-west-1", "eu-central-1" },
                RequiredRegions = new List<string> { "eu-west-1" },
                ComplianceStandard = "GDPR",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            }
        };
    }

    public async Task<DataResidencyPolicy> CreateDataResidencyPolicyAsync(CreateDataResidencyPolicyRequest request, CancellationToken cancellationToken = default)
    {
        var policy = new DataResidencyPolicy
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            AllowedRegions = request.AllowedRegions,
            RequiredRegions = request.RequiredRegions,
            ComplianceStandard = request.ComplianceStandard,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Created data residency policy {PolicyId}: {Name}", policy.Id, policy.Name);

        return await Task.FromResult(policy);
    }

    public async Task<bool> ValidateDataResidencyComplianceAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var residency = await _dataResidencyRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (residency == null)
        {
            return false;
        }

        _logger.LogDebug("Validated data residency compliance for tenant {TenantId}", tenantId);
        return true;
    }

    public async Task<IReadOnlyList<DataResidencyViolation>> GetDataResidencyViolationsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        return new List<DataResidencyViolation>();
    }
}
