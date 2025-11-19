using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Services;

/// <summary>
/// Service for anonymizing personal data in compliance with privacy regulations.
/// </summary>
public interface IAnonymizationService
{
    /// <summary>
    /// Anonymizes all personal data for a specific user.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="userId">The user ID to anonymize</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Anonymization result with statistics</returns>
    Task<AnonymizationResult> AnonymizeUserDataAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Anonymizes data for a specific category.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="category">The data category to anonymize</param>
    /// <param name="olderThan">Only anonymize data older than this date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Anonymization result with statistics</returns>
    Task<AnonymizationResult> AnonymizeCategoryDataAsync(
        Guid tenantId,
        DataCategory category,
        DateTime olderThan,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Anonymizes a specific field value.
    /// </summary>
    /// <param name="value">The value to anonymize</param>
    /// <param name="fieldType">The type of field (email, name, phone, etc.)</param>
    /// <returns>Anonymized value</returns>
    string AnonymizeField(string value, PersonalDataFieldType fieldType);

    /// <summary>
    /// Generates an anonymization report for audit purposes.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="startDate">Report start date</param>
    /// <param name="endDate">Report end date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Anonymization report</returns>
    Task<AnonymizationReport> GenerateReportAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Types of personal data fields for anonymization.
/// </summary>
public enum PersonalDataFieldType
{
    Email,
    Name,
    Phone,
    Address,
    IpAddress,
    UserAgent,
    SocialSecurityNumber,
    CreditCard,
    DateOfBirth,
    Generic
}

/// <summary>
/// Result of an anonymization operation.
/// </summary>
public class AnonymizationResult
{
    /// <summary>
    /// Whether the operation was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Number of records anonymized.
    /// </summary>
    public int RecordsAnonymized { get; set; }

    /// <summary>
    /// Number of fields anonymized.
    /// </summary>
    public int FieldsAnonymized { get; set; }

    /// <summary>
    /// Breakdown by data category.
    /// </summary>
    public Dictionary<string, int> CategoryBreakdown { get; set; } = new();

    /// <summary>
    /// When the anonymization completed.
    /// </summary>
    public DateTime CompletedAt { get; set; }

    /// <summary>
    /// Duration of the operation in milliseconds.
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// Error message if the operation failed.
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Report of anonymization activities.
/// </summary>
public class AnonymizationReport
{
    /// <summary>
    /// Report start date.
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Report end date.
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Total operations performed.
    /// </summary>
    public int TotalOperations { get; set; }

    /// <summary>
    /// Total records anonymized.
    /// </summary>
    public int TotalRecordsAnonymized { get; set; }

    /// <summary>
    /// Operations by category.
    /// </summary>
    public Dictionary<string, int> OperationsByCategory { get; set; } = new();

    /// <summary>
    /// Operations by reason (retention policy, user request, etc.).
    /// </summary>
    public Dictionary<string, int> OperationsByReason { get; set; } = new();
}
