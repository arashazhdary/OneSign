using MediatR;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Audit.Application.Commands;

/// <summary>
/// Severity levels for security events
/// </summary>
public enum SecurityEventSeverity
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

/// <summary>
/// Command for recording security-specific audit events with additional security context
/// </summary>
public class RecordSecurityEventCommand : IRequest<Result<AuditEventDto>>
{
    /// <summary>
    /// The tenant ID where the security event occurred
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// The actor ID (user or service account) that triggered the event
    /// </summary>
    public Guid? ActorId { get; set; }

    /// <summary>
    /// The type of security event
    /// </summary>
    public AuditEventType EventType { get; set; }

    /// <summary>
    /// Human-readable description of the security event
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Severity level of the security event
    /// </summary>
    public SecurityEventSeverity Severity { get; set; } = SecurityEventSeverity.Medium;

    /// <summary>
    /// Source IP address of the request
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// User agent string from the request
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Geographic location derived from IP (if available)
    /// </summary>
    public string? GeoLocation { get; set; }

    /// <summary>
    /// The target resource that was affected
    /// </summary>
    public string? TargetResource { get; set; }

    /// <summary>
    /// The action that was attempted
    /// </summary>
    public string? AttemptedAction { get; set; }

    /// <summary>
    /// Whether the action was blocked
    /// </summary>
    public bool WasBlocked { get; set; }

    /// <summary>
    /// Correlation ID for tracking related events
    /// </summary>
    public string? CorrelationId { get; set; }

    /// <summary>
    /// Session ID if applicable
    /// </summary>
    public string? SessionId { get; set; }

    /// <summary>
    /// Device fingerprint if available
    /// </summary>
    public string? DeviceFingerprint { get; set; }

    /// <summary>
    /// Risk score (0-100) if calculated
    /// </summary>
    public int? RiskScore { get; set; }

    /// <summary>
    /// Additional metadata as JSON
    /// </summary>
    public string? AdditionalMetadata { get; set; }

    /// <summary>
    /// Tags for categorization and filtering
    /// </summary>
    public List<string> Tags { get; set; } = new();

    /// <summary>
    /// Whether this event should trigger immediate alerts
    /// </summary>
    public bool RequiresAlert { get; set; }

    /// <summary>
    /// Whether this event should be reported to compliance systems
    /// </summary>
    public bool RequiresCompliance { get; set; }
}
