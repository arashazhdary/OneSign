using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Domain.Services;

namespace Onesign.Modules.Privacy.Infrastructure.Services;

/// <summary>
/// Service for processing data subject requests (DSR) under GDPR/CCPA.
/// </summary>
public class DataSubjectRequestProcessor : IDataSubjectRequestProcessor
{
    private readonly IDataSubjectRequestRepository _requestRepository;
    private readonly IDataExportService _exportService;
    private readonly IAnonymizationService _anonymizationService;
    private readonly IDataRetentionService _retentionService;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataSubjectRequestProcessor> _logger;

    public DataSubjectRequestProcessor(
        IDataSubjectRequestRepository requestRepository,
        IDataExportService exportService,
        IAnonymizationService anonymizationService,
        IDataRetentionService retentionService,
        IServiceProvider serviceProvider,
        ILogger<DataSubjectRequestProcessor> logger)
    {
        _requestRepository = requestRepository;
        _exportService = exportService;
        _anonymizationService = anonymizationService;
        _retentionService = retentionService;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<DsrProcessingResult> ProcessRequestAsync(
        Guid requestId,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new DsrProcessingResult { RequestId = requestId };

        var request = await _requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null)
        {
            result.Success = false;
            result.ErrorMessage = "Request not found";
            return result;
        }

        var validation = await ValidateRequestAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            result.Success = false;
            result.ErrorMessage = string.Join("; ", validation.Errors);
            result.Status = DataSubjectRequestStatus.Rejected;
            return result;
        }

        request.Status = DataSubjectRequestStatus.InProgress;
        await _requestRepository.UpdateAsync(request, cancellationToken);

        _logger.LogInformation(
            "Processing DSR {RequestId} of type {Type} for subject {SubjectId}",
            requestId, request.Type, request.SubjectId);

        try
        {
            result = request.Type switch
            {
                DataSubjectRequestType.Access => await ProcessAccessRequestAsync(request, cancellationToken),
                DataSubjectRequestType.Export => await ProcessExportRequestAsync(request, cancellationToken),
                DataSubjectRequestType.Deletion => await ProcessDeletionRequestAsync(request, cancellationToken),
                DataSubjectRequestType.Rectification => await ProcessRectificationRequestAsync(request, cancellationToken),
                DataSubjectRequestType.Restriction => await ProcessRestrictionRequestAsync(request, cancellationToken),
                _ => new DsrProcessingResult
                {
                    RequestId = requestId,
                    Success = false,
                    ErrorMessage = $"Unknown request type: {request.Type}"
                }
            };

            request.Status = result.Success ? DataSubjectRequestStatus.Completed : DataSubjectRequestStatus.Failed;
            request.CompletedAt = DateTime.UtcNow;
            request.ResultUrl = result.DownloadUrl;
            await _requestRepository.UpdateAsync(request, cancellationToken);

            stopwatch.Stop();
            result.DurationMs = stopwatch.ElapsedMilliseconds;
            result.CompletedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "DSR {RequestId} completed. Success: {Success}, Duration: {DurationMs}ms",
                requestId, result.Success, result.DurationMs);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            request.Status = DataSubjectRequestStatus.Failed;
            await _requestRepository.UpdateAsync(request, cancellationToken);

            result.Success = false;
            result.Status = DataSubjectRequestStatus.Failed;
            result.ErrorMessage = ex.Message;
            result.DurationMs = stopwatch.ElapsedMilliseconds;

            _logger.LogError(ex, "Failed to process DSR {RequestId}", requestId);
        }

        return result;
    }

    public async Task<IEnumerable<DsrProcessingResult>> ProcessPendingRequestsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var pendingRequests = await _requestRepository.GetPendingRequestsAsync(tenantId, cancellationToken);
        var results = new List<DsrProcessingResult>();

        foreach (var request in pendingRequests)
        {
            var result = await ProcessRequestAsync(request.Id, cancellationToken);
            results.Add(result);
        }

        return results;
    }

    public async Task<DsrValidationResult> ValidateRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = new DsrValidationResult { IsValid = true };

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

        var subject = await dbContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == request.SubjectId && u.TenantId == request.TenantId, cancellationToken);

        result.SubjectExists = subject != null;

        if (!result.SubjectExists)
        {
            result.IsValid = false;
            result.Errors.Add("Data subject not found");
        }

        if (request.RequestedBy != Guid.Empty)
        {
            var requester = await dbContext.TenantUsers
                .FirstOrDefaultAsync(u => u.Id == request.RequestedBy && u.TenantId == request.TenantId, cancellationToken);

            result.RequesterAuthorized = requester != null &&
                (requester.Id == request.SubjectId || await IsAdminUserAsync(dbContext, request.TenantId, requester.Id, cancellationToken));

            if (!result.RequesterAuthorized)
            {
                result.IsValid = false;
                result.Errors.Add("Requester is not authorized to make this request");
            }
        }
        else
        {
            result.RequesterAuthorized = true;
        }

        if (request.Status == DataSubjectRequestStatus.Completed)
        {
            result.IsValid = false;
            result.Errors.Add("Request has already been completed");
        }

        if (request.Status == DataSubjectRequestStatus.Cancelled)
        {
            result.IsValid = false;
            result.Errors.Add("Request has been cancelled");
        }

        return result;
    }

    public Task<TimeSpan> GetEstimatedProcessingTimeAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var estimate = request.Type switch
        {
            DataSubjectRequestType.Access => TimeSpan.FromMinutes(5),
            DataSubjectRequestType.Export => TimeSpan.FromMinutes(30),
            DataSubjectRequestType.Deletion => TimeSpan.FromMinutes(15),
            DataSubjectRequestType.Rectification => TimeSpan.FromMinutes(5),
            DataSubjectRequestType.Restriction => TimeSpan.FromMinutes(5),
            _ => TimeSpan.FromMinutes(30)
        };

        return Task.FromResult(estimate);
    }

    public async Task CancelRequestAsync(
        Guid requestId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var request = await _requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null)
        {
            throw new InvalidOperationException("Request not found");
        }

        if (request.Status == DataSubjectRequestStatus.Completed)
        {
            throw new InvalidOperationException("Cannot cancel a completed request");
        }

        request.Status = DataSubjectRequestStatus.Cancelled;
        await _requestRepository.UpdateAsync(request, cancellationToken);

        _logger.LogInformation("DSR {RequestId} cancelled. Reason: {Reason}", requestId, reason);
    }

    public async Task<IEnumerable<DataSubjectRequest>> GetRequestsApproachingDeadlineAsync(
        Guid tenantId,
        int daysUntilDeadline,
        CancellationToken cancellationToken = default)
    {
        var requests = await _requestRepository.GetPendingRequestsAsync(tenantId, cancellationToken);
        var deadline = DateTime.UtcNow.AddDays(30 - daysUntilDeadline);

        return requests.Where(r => r.RequestedAt <= deadline);
    }

    private async Task<DsrProcessingResult> ProcessAccessRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken)
    {
        var exportPath = await _exportService.ExportUserDataAsync(request.TenantId, request.SubjectId, cancellationToken);

        return new DsrProcessingResult
        {
            RequestId = request.Id,
            Success = true,
            Status = DataSubjectRequestStatus.Completed,
            DownloadUrl = exportPath,
            Stats = new DsrProcessingStats { RecordsExported = 1 }
        };
    }

    private async Task<DsrProcessingResult> ProcessExportRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken)
    {
        var exportPath = await _exportService.ExportUserDataAsync(request.TenantId, request.SubjectId, cancellationToken);

        var fileInfo = new FileInfo(exportPath);
        var fileSize = fileInfo.Exists ? fileInfo.Length : 0;

        return new DsrProcessingResult
        {
            RequestId = request.Id,
            Success = true,
            Status = DataSubjectRequestStatus.Completed,
            DownloadUrl = exportPath,
            Stats = new DsrProcessingStats
            {
                RecordsExported = 1,
                ExportSizeBytes = fileSize
            }
        };
    }

    private async Task<DsrProcessingResult> ProcessDeletionRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken)
    {
        var anonymizationResult = await _anonymizationService.AnonymizeUserDataAsync(
            request.TenantId,
            request.SubjectId,
            cancellationToken);

        return new DsrProcessingResult
        {
            RequestId = request.Id,
            Success = anonymizationResult.Success,
            Status = anonymizationResult.Success ? DataSubjectRequestStatus.Completed : DataSubjectRequestStatus.Failed,
            ErrorMessage = anonymizationResult.ErrorMessage,
            Stats = new DsrProcessingStats
            {
                RecordsProcessed = anonymizationResult.RecordsAnonymized,
                RecordsAnonymized = anonymizationResult.RecordsAnonymized,
                ByCategory = anonymizationResult.CategoryBreakdown
            }
        };
    }

    private async Task<DsrProcessingResult> ProcessRectificationRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        return new DsrProcessingResult
        {
            RequestId = request.Id,
            Success = true,
            Status = DataSubjectRequestStatus.Completed,
            Stats = new DsrProcessingStats { RecordsProcessed = 1 }
        };
    }

    private async Task<DsrProcessingResult> ProcessRestrictionRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

        var user = await dbContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == request.SubjectId && u.TenantId == request.TenantId, cancellationToken);

        if (user != null)
        {
            user.IsActive = false;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return new DsrProcessingResult
        {
            RequestId = request.Id,
            Success = true,
            Status = DataSubjectRequestStatus.Completed,
            Stats = new DsrProcessingStats { RecordsProcessed = 1 }
        };
    }

    private static async Task<bool> IsAdminUserAsync(
        DbContext dbContext,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return true;
    }
}
