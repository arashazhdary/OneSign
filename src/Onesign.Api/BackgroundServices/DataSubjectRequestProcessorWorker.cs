using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Services;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that processes pending data subject requests (DSR) for GDPR/CCPA compliance.
/// Handles access, export, deletion, and restriction requests.
/// </summary>
public class DataSubjectRequestProcessorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataSubjectRequestProcessorWorker> _logger;
    private readonly IConfiguration _configuration;

    public DataSubjectRequestProcessorWorker(
        IServiceProvider serviceProvider,
        ILogger<DataSubjectRequestProcessorWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:DsrProcessor:IntervalMinutes", 15);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);
        var deadlineWarningDays = _configuration.GetValue("BackgroundServices:DsrProcessor:DeadlineWarningDays", 5);

        _logger.LogInformation("DataSubjectRequestProcessorWorker starting with interval of {Interval} minutes", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingRequestsAsync(stoppingToken);
                await CheckDeadlineWarningsAsync(deadlineWarningDays, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DataSubjectRequestProcessorWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessPendingRequestsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var pendingRequests = await dbContext.DataSubjectRequests
            .Where(r => r.Status == (int)DataSubjectRequestStatus.Requested ||
                       r.Status == (int)DataSubjectRequestStatus.Approved)
            .OrderBy(r => r.RequestedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        if (!pendingRequests.Any())
        {
            _logger.LogDebug("No pending data subject requests to process");
            return;
        }

        _logger.LogInformation("Processing {Count} pending data subject requests", pendingRequests.Count);

        var processed = 0;
        var succeeded = 0;
        var failed = 0;

        foreach (var request in pendingRequests)
        {
            try
            {
                var result = await ProcessSingleRequestAsync(request, cancellationToken);
                processed++;

                if (result)
                {
                    succeeded++;
                }
                else
                {
                    failed++;
                }
            }
            catch (Exception ex)
            {
                failed++;
                _logger.LogError(ex, "Error processing DSR {RequestId}", request.Id);

                request.Status = (int)DataSubjectRequestStatus.Rejected;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        _logger.LogInformation(
            "DSR processing completed. Processed: {Processed}, Succeeded: {Succeeded}, Failed: {Failed}",
            processed, succeeded, failed);
    }

    private async Task<bool> ProcessSingleRequestAsync(
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataSubjectRequestEntity request,
        CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var requestProcessor = scope.ServiceProvider.GetRequiredService<IDataSubjectRequestProcessor>();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        request.Status = (int)DataSubjectRequestStatus.Processing;
        await dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Processing DSR {RequestId} of type {Type} for subject {SubjectId}",
            request.Id, (DataSubjectRequestType)request.Type, request.SubjectId);

        var result = await requestProcessor.ProcessRequestAsync(request.Id, cancellationToken);

        if (result.Success)
        {
            request.Status = (int)DataSubjectRequestStatus.Completed;
            request.CompletedAt = DateTime.UtcNow;
            request.ResultLocation = result.DownloadUrl;

            await LogDsrCompletionAsync(dbContext, request, result, cancellationToken);

            _logger.LogInformation(
                "DSR {RequestId} completed successfully. Duration: {DurationMs}ms",
                request.Id, result.DurationMs);
        }
        else
        {
            request.Status = (int)DataSubjectRequestStatus.Rejected;

            await LogDsrFailureAsync(dbContext, request, result.ErrorMessage, cancellationToken);

            _logger.LogWarning(
                "DSR {RequestId} failed. Error: {Error}",
                request.Id, result.ErrorMessage);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return result.Success;
    }

    private async Task CheckDeadlineWarningsAsync(int warningDays, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var deadlineThreshold = DateTime.UtcNow.AddDays(-(30 - warningDays));

        var approachingDeadline = await dbContext.DataSubjectRequests
            .Where(r => (r.Status == (int)DataSubjectRequestStatus.Requested ||
                        r.Status == (int)DataSubjectRequestStatus.Approved ||
                        r.Status == (int)DataSubjectRequestStatus.Processing) &&
                       r.RequestedAt <= deadlineThreshold)
            .ToListAsync(cancellationToken);

        if (approachingDeadline.Any())
        {
            _logger.LogWarning(
                "{Count} data subject requests are approaching their 30-day deadline",
                approachingDeadline.Count);

            foreach (var request in approachingDeadline)
            {
                var daysRemaining = 30 - (DateTime.UtcNow - request.RequestedAt).TotalDays;
                _logger.LogWarning(
                    "DSR {RequestId} for tenant {TenantId} has {DaysRemaining:F0} days until deadline",
                    request.Id, request.TenantId, daysRemaining);

                await CreateDeadlineWarningAsync(dbContext, request, daysRemaining, cancellationToken);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task LogDsrCompletionAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataSubjectRequestEntity request,
        DsrProcessingResult result,
        CancellationToken cancellationToken)
    {
        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            EventType = GetAuditEventType((DataSubjectRequestType)request.Type),
            Description = $"Data subject request completed: {(DataSubjectRequestType)request.Type}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                RequestId = request.Id,
                SubjectId = request.SubjectId,
                Type = ((DataSubjectRequestType)request.Type).ToString(),
                DurationMs = result.DurationMs,
                RecordsProcessed = result.Stats.RecordsProcessed,
                RecordsDeleted = result.Stats.RecordsDeleted,
                RecordsExported = result.Stats.RecordsExported
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task LogDsrFailureAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataSubjectRequestEntity request,
        string? errorMessage,
        CancellationToken cancellationToken)
    {
        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged,
            Description = $"Data subject request failed: {(DataSubjectRequestType)request.Type}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                RequestId = request.Id,
                SubjectId = request.SubjectId,
                Type = ((DataSubjectRequestType)request.Type).ToString(),
                Error = errorMessage
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task CreateDeadlineWarningAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataSubjectRequestEntity request,
        double daysRemaining,
        CancellationToken cancellationToken)
    {
        var notification = new Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Channel = 0,
            Priority = 2,
            Subject = $"DSR Deadline Warning - {daysRemaining:F0} days remaining",
            Body = $"Data subject request {request.Id} is approaching its 30-day deadline with {daysRemaining:F0} days remaining.",
            Status = 0,
            CreatedAt = DateTime.UtcNow,
            NextRetryAt = DateTime.UtcNow
        };

        dbContext.NotificationOutboxItems.Add(notification);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Onesign.Modules.Audit.Domain.Enums.AuditEventType GetAuditEventType(DataSubjectRequestType type)
    {
        return type switch
        {
            DataSubjectRequestType.Export => Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataExported,
            DataSubjectRequestType.Delete => Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataDeleted,
            _ => Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged
        };
    }
}
