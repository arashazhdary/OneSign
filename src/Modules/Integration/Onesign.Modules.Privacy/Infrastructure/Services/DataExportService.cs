using System.IO.Compression;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Privacy.Domain.Services;

namespace Onesign.Modules.Privacy.Infrastructure.Services;

/// <summary>
/// Service for exporting user data in compliance with data portability requirements.
/// </summary>
public class DataExportService : IDataExportService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataExportService> _logger;
    private readonly string _exportBasePath;

    public DataExportService(
        IServiceProvider serviceProvider,
        ILogger<DataExportService> logger,
        Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _exportBasePath = configuration["Privacy:ExportPath"] ?? Path.Combine(Path.GetTempPath(), "onesign-exports");

        if (!Directory.Exists(_exportBasePath))
        {
            Directory.CreateDirectory(_exportBasePath);
        }
    }

    public async Task<string> ExportUserDataAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting data export for user {UserId} in tenant {TenantId}", userId, tenantId);

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

        var exportData = new UserDataExport
        {
            ExportId = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            ExportedAt = DateTime.UtcNow,
            DataCategories = new List<DataCategoryExport>()
        };

        var userDataExport = await ExportUserProfileAsync(dbContext, tenantId, userId, cancellationToken);
        if (userDataExport != null)
        {
            exportData.DataCategories.Add(userDataExport);
        }

        var sessionsExport = await ExportSessionsAsync(dbContext, userId, cancellationToken);
        if (sessionsExport != null)
        {
            exportData.DataCategories.Add(sessionsExport);
        }

        var auditExport = await ExportAuditLogsAsync(dbContext, tenantId, userId, cancellationToken);
        if (auditExport != null)
        {
            exportData.DataCategories.Add(auditExport);
        }

        var mfaExport = await ExportMfaDataAsync(dbContext, userId, cancellationToken);
        if (mfaExport != null)
        {
            exportData.DataCategories.Add(mfaExport);
        }

        var devicesExport = await ExportDevicesAsync(dbContext, userId, cancellationToken);
        if (devicesExport != null)
        {
            exportData.DataCategories.Add(devicesExport);
        }

        var exportPath = await SaveExportAsync(exportData, cancellationToken);

        await LogExportEventAsync(dbContext, tenantId, userId, exportData, exportPath, cancellationToken);

        _logger.LogInformation(
            "Data export completed for user {UserId}. Export ID: {ExportId}, Path: {Path}",
            userId, exportData.ExportId, exportPath);

        return exportPath;
    }

    private async Task<DataCategoryExport?> ExportUserProfileAsync(
        DbContext dbContext,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId, cancellationToken);

        if (user == null) return null;

        return new DataCategoryExport
        {
            Category = "UserProfile",
            RecordCount = 1,
            Data = new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.IsActive,
                user.EmailVerified,
                user.CreatedAt,
                user.UpdatedAt,
                user.LastLoginAt,
                user.Locale,
                user.Timezone
            }
        };
    }

    private async Task<DataCategoryExport?> ExportSessionsAsync(
        DbContext dbContext,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sessions = await dbContext.UserLoginSessions
            .Where(s => s.UserId == userId)
            .Select(s => new
            {
                s.Id,
                s.CreatedAt,
                s.ExpiresAt,
                s.RevokedAt,
                s.IpAddress,
                s.UserAgent,
                s.DeviceInfo
            })
            .ToListAsync(cancellationToken);

        if (!sessions.Any()) return null;

        return new DataCategoryExport
        {
            Category = "Sessions",
            RecordCount = sessions.Count,
            Data = sessions
        };
    }

    private async Task<DataCategoryExport?> ExportAuditLogsAsync(
        DbContext dbContext,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var auditEvents = await dbContext.AuditEvents
            .Where(a => a.TenantId == tenantId && a.ActorId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(1000)
            .Select(a => new
            {
                a.Id,
                a.EventType,
                a.Description,
                a.IpAddress,
                a.UserAgent,
                a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        if (!auditEvents.Any()) return null;

        return new DataCategoryExport
        {
            Category = "AuditLogs",
            RecordCount = auditEvents.Count,
            Data = auditEvents
        };
    }

    private async Task<DataCategoryExport?> ExportMfaDataAsync(
        DbContext dbContext,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var mfaEnrollments = await dbContext.MfaEnrollments
            .Where(m => m.UserId == userId)
            .Select(m => new
            {
                m.Id,
                m.Method,
                m.IsVerified,
                m.CreatedAt,
                m.LastUsedAt
            })
            .ToListAsync(cancellationToken);

        if (!mfaEnrollments.Any()) return null;

        return new DataCategoryExport
        {
            Category = "MfaEnrollments",
            RecordCount = mfaEnrollments.Count,
            Data = mfaEnrollments
        };
    }

    private async Task<DataCategoryExport?> ExportDevicesAsync(
        DbContext dbContext,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var devices = await dbContext.TrustedDevices
            .Where(d => d.UserId == userId)
            .Select(d => new
            {
                d.Id,
                d.DeviceName,
                d.DeviceType,
                d.LastUsedAt,
                d.CreatedAt,
                d.TrustedUntil
            })
            .ToListAsync(cancellationToken);

        if (!devices.Any()) return null;

        return new DataCategoryExport
        {
            Category = "TrustedDevices",
            RecordCount = devices.Count,
            Data = devices
        };
    }

    private async Task<string> SaveExportAsync(UserDataExport exportData, CancellationToken cancellationToken)
    {
        var fileName = $"export-{exportData.UserId}-{exportData.ExportedAt:yyyyMMddHHmmss}.zip";
        var filePath = Path.Combine(_exportBasePath, fileName);

        var jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        using var fileStream = new FileStream(filePath, FileMode.Create);
        using var archive = new ZipArchive(fileStream, ZipArchiveMode.Create);

        var manifestEntry = archive.CreateEntry("manifest.json");
        using (var manifestStream = manifestEntry.Open())
        {
            var manifest = new
            {
                exportData.ExportId,
                exportData.TenantId,
                exportData.UserId,
                exportData.ExportedAt,
                Categories = exportData.DataCategories.Select(c => new
                {
                    c.Category,
                    c.RecordCount
                })
            };
            await JsonSerializer.SerializeAsync(manifestStream, manifest, jsonOptions, cancellationToken);
        }

        foreach (var category in exportData.DataCategories)
        {
            var entryName = $"data/{category.Category.ToLowerInvariant()}.json";
            var entry = archive.CreateEntry(entryName);
            using var entryStream = entry.Open();
            await JsonSerializer.SerializeAsync(entryStream, category.Data, jsonOptions, cancellationToken);
        }

        var readmeEntry = archive.CreateEntry("README.txt");
        using (var readmeStream = readmeEntry.Open())
        using (var writer = new StreamWriter(readmeStream, Encoding.UTF8))
        {
            await writer.WriteLineAsync("OneSign Data Export");
            await writer.WriteLineAsync("====================");
            await writer.WriteLineAsync($"Export ID: {exportData.ExportId}");
            await writer.WriteLineAsync($"Generated: {exportData.ExportedAt:O}");
            await writer.WriteLineAsync();
            await writer.WriteLineAsync("This archive contains your personal data as stored in OneSign.");
            await writer.WriteLineAsync("Data is provided in JSON format for portability.");
        }

        return filePath;
    }

    private static async Task LogExportEventAsync(
        DbContext dbContext,
        Guid tenantId,
        Guid userId,
        UserDataExport exportData,
        string exportPath,
        CancellationToken cancellationToken)
    {
        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ActorId = userId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataExported,
            Description = "User data exported",
            Metadata = JsonSerializer.Serialize(new
            {
                ExportId = exportData.ExportId,
                Categories = exportData.DataCategories.Select(c => c.Category),
                TotalRecords = exportData.DataCategories.Sum(c => c.RecordCount),
                FilePath = exportPath
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private class UserDataExport
    {
        public Guid ExportId { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public DateTime ExportedAt { get; set; }
        public List<DataCategoryExport> DataCategories { get; set; } = new();
    }

    private class DataCategoryExport
    {
        public string Category { get; set; } = string.Empty;
        public int RecordCount { get; set; }
        public object? Data { get; set; }
    }
}
