using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Services;

/// <summary>
/// Service for processing data subject requests (DSR) under GDPR/CCPA.
/// </summary>
public interface IDataSubjectRequestProcessor
{
    /// <summary>
    /// Processes a data subject request.
    /// </summary>
    /// <param name="requestId">The request ID to process</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Processing result</returns>
    Task<DsrProcessingResult> ProcessRequestAsync(Guid requestId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes all pending requests for a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of processing results</returns>
    Task<IEnumerable<DsrProcessingResult>> ProcessPendingRequestsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates a data subject request before processing.
    /// </summary>
    /// <param name="request">The request to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Validation result</returns>
    Task<DsrValidationResult> ValidateRequestAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the estimated time to complete a request.
    /// </summary>
    /// <param name="request">The request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Estimated completion time</returns>
    Task<TimeSpan> GetEstimatedProcessingTimeAsync(
        DataSubjectRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a pending request.
    /// </summary>
    /// <param name="requestId">The request ID</param>
    /// <param name="reason">Reason for cancellation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task CancelRequestAsync(Guid requestId, string reason, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets requests that are approaching their deadline.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="daysUntilDeadline">Number of days until deadline</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of requests approaching deadline</returns>
    Task<IEnumerable<DataSubjectRequest>> GetRequestsApproachingDeadlineAsync(
        Guid tenantId,
        int daysUntilDeadline,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of processing a data subject request.
/// </summary>
public class DsrProcessingResult
{
    /// <summary>
    /// The request ID.
    /// </summary>
    public Guid RequestId { get; set; }

    /// <summary>
    /// Whether processing was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Final status of the request.
    /// </summary>
    public DataSubjectRequestStatus Status { get; set; }

    /// <summary>
    /// When processing completed.
    /// </summary>
    public DateTime CompletedAt { get; set; }

    /// <summary>
    /// Duration of processing in milliseconds.
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// Download URL for data export requests.
    /// </summary>
    public string? DownloadUrl { get; set; }

    /// <summary>
    /// Statistics about the processed data.
    /// </summary>
    public DsrProcessingStats Stats { get; set; } = new();

    /// <summary>
    /// Error message if processing failed.
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Statistics about DSR processing.
/// </summary>
public class DsrProcessingStats
{
    /// <summary>
    /// Number of records processed.
    /// </summary>
    public int RecordsProcessed { get; set; }

    /// <summary>
    /// Number of records deleted.
    /// </summary>
    public int RecordsDeleted { get; set; }

    /// <summary>
    /// Number of records anonymized.
    /// </summary>
    public int RecordsAnonymized { get; set; }

    /// <summary>
    /// Number of records exported.
    /// </summary>
    public int RecordsExported { get; set; }

    /// <summary>
    /// Size of exported data in bytes.
    /// </summary>
    public long ExportSizeBytes { get; set; }

    /// <summary>
    /// Breakdown by data category.
    /// </summary>
    public Dictionary<string, int> ByCategory { get; set; } = new();
}

/// <summary>
/// Result of validating a DSR.
/// </summary>
public class DsrValidationResult
{
    /// <summary>
    /// Whether the request is valid.
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Validation errors.
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Validation warnings.
    /// </summary>
    public List<string> Warnings { get; set; } = new();

    /// <summary>
    /// Whether the subject exists.
    /// </summary>
    public bool SubjectExists { get; set; }

    /// <summary>
    /// Whether the requester is authorized.
    /// </summary>
    public bool RequesterAuthorized { get; set; }
}
