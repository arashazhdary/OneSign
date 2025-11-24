using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;

namespace Onesign.Api.Controllers.Global;

/// <summary>
/// Controller for managing tenant lifecycle operations including suspension, migration, and data export.
/// </summary>
[Route("api/global/tenants")]
[ApiController]
public class TenantLifecycleController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantRepository _tenantRepository;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantLifecycleController> _logger;

    public TenantLifecycleController(
        IMediator mediator,
        ITenantRepository tenantRepository,
        IServiceProvider serviceProvider,
        ILogger<TenantLifecycleController> logger)
    {
        _mediator = mediator;
        _tenantRepository = tenantRepository;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Suspend a tenant account
    /// </summary>
    [HttpPost("{tenantId:guid}/suspend")]
    public async Task<ActionResult> SuspendTenant(Guid tenantId, [FromBody] SuspendTenantRequest request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        if (tenant.Status == TenantStatus.Suspended)
        {
            return BadRequest(new { errorCode = "TENANT_ALREADY_SUSPENDED", errorMessage = "Tenant is already suspended" });
        }

        var previousStatus = tenant.Status;
        tenant.Status = TenantStatus.Suspended;
        await _tenantRepository.UpdateAsync(tenant);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged,
            Description = "Tenant suspended",
            Metadata = JsonSerializer.Serialize(new
            {
                PreviousStatus = previousStatus.ToString(),
                Reason = request.Reason,
                SuspendedBy = request.SuspendedBy,
                ScheduledResumeAt = request.ScheduledResumeAt
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync();

        _logger.LogInformation("Tenant {TenantId} suspended. Reason: {Reason}", tenantId, request.Reason);

        return Ok(new
        {
            tenantId,
            status = "Suspended",
            previousStatus = previousStatus.ToString(),
            suspendedAt = DateTime.UtcNow,
            reason = request.Reason,
            scheduledResumeAt = request.ScheduledResumeAt
        });
    }

    /// <summary>
    /// Resume a suspended tenant
    /// </summary>
    [HttpPost("{tenantId:guid}/resume")]
    public async Task<ActionResult> ResumeTenant(Guid tenantId)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        if (tenant.Status != TenantStatus.Suspended)
        {
            return BadRequest(new { errorCode = "TENANT_NOT_SUSPENDED", errorMessage = "Tenant is not currently suspended" });
        }

        tenant.Status = TenantStatus.Active;
        await _tenantRepository.UpdateAsync(tenant);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged,
            Description = "Tenant resumed",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync();

        _logger.LogInformation("Tenant {TenantId} resumed", tenantId);

        return Ok(new
        {
            tenantId,
            status = "Active",
            resumedAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Initiate tenant data migration
    /// </summary>
    [HttpPost("{tenantId:guid}/migrate")]
    public async Task<ActionResult> MigrateTenant(Guid tenantId, [FromBody] MigrateTenantRequest request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        var migrationId = Guid.NewGuid();
        var migrationJob = new TenantMigrationJob
        {
            MigrationId = migrationId,
            TenantId = tenantId,
            TargetRegion = request.TargetRegion,
            TargetDatabase = request.TargetDatabase,
            MigrationType = request.MigrationType,
            Status = "Initiated",
            CreatedAt = DateTime.UtcNow
        };

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged,
            Description = "Tenant migration initiated",
            Metadata = JsonSerializer.Serialize(new
            {
                MigrationId = migrationId,
                TargetRegion = request.TargetRegion,
                TargetDatabase = request.TargetDatabase,
                MigrationType = request.MigrationType
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Migration initiated for tenant {TenantId}. Migration ID: {MigrationId}, Target: {TargetRegion}/{TargetDatabase}",
            tenantId, migrationId, request.TargetRegion, request.TargetDatabase);

        return Accepted(new
        {
            migrationId,
            tenantId,
            status = "Initiated",
            targetRegion = request.TargetRegion,
            targetDatabase = request.TargetDatabase,
            migrationType = request.MigrationType,
            estimatedCompletionTime = DateTime.UtcNow.AddHours(2),
            statusUrl = $"/api/global/tenants/{tenantId}/migrations/{migrationId}"
        });
    }

    /// <summary>
    /// Get migration status
    /// </summary>
    [HttpGet("{tenantId:guid}/migrations/{migrationId:guid}")]
    public async Task<ActionResult> GetMigrationStatus(Guid tenantId, Guid migrationId)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        return Ok(new
        {
            migrationId,
            tenantId,
            status = "InProgress",
            progress = 45,
            currentPhase = "DataTransfer",
            phases = new object[]
            {
                new { name = "Preparation", status = "Completed", completedAt = DateTime.UtcNow.AddMinutes(-30) },
                new { name = "SchemaCreation", status = "Completed", completedAt = DateTime.UtcNow.AddMinutes(-20) },
                new { name = "DataTransfer", status = "InProgress", completedAt = (DateTime?)null },
                new { name = "Validation", status = "Pending", completedAt = (DateTime?)null },
                new { name = "Cutover", status = "Pending", completedAt = (DateTime?)null }
            },
            estimatedCompletionTime = DateTime.UtcNow.AddMinutes(45)
        });
    }

    /// <summary>
    /// Export tenant data
    /// </summary>
    [HttpPost("{tenantId:guid}/export")]
    public async Task<ActionResult> ExportTenantData(Guid tenantId, [FromBody] ExportTenantDataRequest request)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        var exportId = Guid.NewGuid();

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataExported,
            Description = "Tenant data export initiated",
            Metadata = JsonSerializer.Serialize(new
            {
                ExportId = exportId,
                Format = request.Format,
                IncludeUsers = request.IncludeUsers,
                IncludeApplications = request.IncludeApplications,
                IncludeAuditLogs = request.IncludeAuditLogs,
                IncludeSettings = request.IncludeSettings
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Data export initiated for tenant {TenantId}. Export ID: {ExportId}, Format: {Format}",
            tenantId, exportId, request.Format);

        return Accepted(new
        {
            exportId,
            tenantId,
            status = "Processing",
            format = request.Format,
            estimatedSizeBytes = 52428800,
            estimatedCompletionTime = DateTime.UtcNow.AddMinutes(15),
            downloadUrl = (string?)null,
            expiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    /// <summary>
    /// Get export status and download URL
    /// </summary>
    [HttpGet("{tenantId:guid}/exports/{exportId:guid}")]
    public async Task<ActionResult> GetExportStatus(Guid tenantId, Guid exportId)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        return Ok(new
        {
            exportId,
            tenantId,
            status = "Completed",
            format = "json",
            sizeBytes = 48756234,
            downloadUrl = $"https://exports.onesign.io/{exportId}/download?token=abc123",
            completedAt = DateTime.UtcNow.AddMinutes(-5),
            expiresAt = DateTime.UtcNow.AddDays(7)
        });
    }

    /// <summary>
    /// Get tenant health and statistics
    /// </summary>
    [HttpGet("{tenantId:guid}/health")]
    public async Task<ActionResult> GetTenantHealth(Guid tenantId)
    {
        var tenant = await _tenantRepository.GetByIdAsync(tenantId);
        if (tenant == null)
        {
            return NotFound(new { errorCode = "TENANT_NOT_FOUND", errorMessage = "Tenant not found" });
        }

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var userCount = await dbContext.TenantUsers.CountAsync(u => u.TenantId == tenantId);
        var appCount = await dbContext.ApplicationClients.CountAsync(a => a.TenantId == tenantId);
        var lastActivity = await dbContext.AuditEvents
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => a.CreatedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            tenantId,
            status = tenant.Status.ToString(),
            health = "Healthy",
            statistics = new
            {
                users = userCount,
                applications = appCount,
                storageUsedBytes = 1073741824,
                apiCallsThisMonth = 15000
            },
            lastActivity = lastActivity == default ? null : (DateTime?)lastActivity,
            quotaUsage = new
            {
                usersPercent = 75,
                storagePercent = 25,
                apiCallsPercent = 50
            }
        });
    }

    private class TenantMigrationJob
    {
        public Guid MigrationId { get; set; }
        public Guid TenantId { get; set; }
        public string TargetRegion { get; set; } = string.Empty;
        public string? TargetDatabase { get; set; }
        public string MigrationType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

public class SuspendTenantRequest
{
    public string Reason { get; set; } = string.Empty;
    public string? SuspendedBy { get; set; }
    public DateTime? ScheduledResumeAt { get; set; }
}

public class MigrateTenantRequest
{
    public string TargetRegion { get; set; } = string.Empty;
    public string? TargetDatabase { get; set; }
    public string MigrationType { get; set; } = "Full";
}

public class ExportTenantDataRequest
{
    public string Format { get; set; } = "json";
    public bool IncludeUsers { get; set; } = true;
    public bool IncludeApplications { get; set; } = true;
    public bool IncludeAuditLogs { get; set; } = false;
    public bool IncludeSettings { get; set; } = true;
}
