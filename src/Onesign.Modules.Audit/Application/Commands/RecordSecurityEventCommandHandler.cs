using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Audit.Application.Commands;

/// <summary>
/// Handler for RecordSecurityEventCommand that records security events with enhanced metadata
/// </summary>
public class RecordSecurityEventCommandHandler : IRequestHandler<RecordSecurityEventCommand, Result<AuditEventDto>>
{
    private readonly IAuditEventRepository _auditEventRepository;
    private readonly ILogger<RecordSecurityEventCommandHandler> _logger;

    public RecordSecurityEventCommandHandler(
        IAuditEventRepository auditEventRepository,
        ILogger<RecordSecurityEventCommandHandler> logger)
    {
        _auditEventRepository = auditEventRepository;
        _logger = logger;
    }

    public async Task<Result<AuditEventDto>> Handle(RecordSecurityEventCommand request, CancellationToken cancellationToken)
    {
        // Build comprehensive security metadata
        var securityMetadata = new SecurityEventMetadata
        {
            Severity = request.Severity.ToString(),
            GeoLocation = request.GeoLocation,
            TargetResource = request.TargetResource,
            AttemptedAction = request.AttemptedAction,
            WasBlocked = request.WasBlocked,
            CorrelationId = request.CorrelationId,
            SessionId = request.SessionId,
            DeviceFingerprint = request.DeviceFingerprint,
            RiskScore = request.RiskScore,
            Tags = request.Tags,
            RequiresAlert = request.RequiresAlert,
            RequiresCompliance = request.RequiresCompliance,
            AdditionalData = request.AdditionalMetadata
        };

        var metadataJson = JsonSerializer.Serialize(securityMetadata);

        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            ActorId = request.ActorId,
            EventType = request.EventType,
            Description = request.Description,
            Metadata = metadataJson,
            CreatedAt = DateTime.UtcNow,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent
        };

        // Log security events at appropriate levels
        LogSecurityEvent(request, auditEvent.Id);

        var createdEvent = await _auditEventRepository.AddAsync(auditEvent, cancellationToken);

        // If alert is required, trigger notification (in a real system)
        if (request.RequiresAlert)
        {
            await TriggerSecurityAlertAsync(request, createdEvent.Id);
        }

        return Result.Success(new AuditEventDto
        {
            Id = createdEvent.Id,
            TenantId = createdEvent.TenantId,
            ActorId = createdEvent.ActorId,
            EventType = createdEvent.EventType,
            Description = createdEvent.Description,
            Metadata = createdEvent.Metadata,
            CreatedAt = createdEvent.CreatedAt,
            IpAddress = createdEvent.IpAddress,
            UserAgent = createdEvent.UserAgent
        });
    }

    private void LogSecurityEvent(RecordSecurityEventCommand request, Guid eventId)
    {
        var logLevel = request.Severity switch
        {
            SecurityEventSeverity.Critical => LogLevel.Critical,
            SecurityEventSeverity.High => LogLevel.Error,
            SecurityEventSeverity.Medium => LogLevel.Warning,
            _ => LogLevel.Information
        };

        _logger.Log(logLevel,
            "Security Event [{EventId}] Type: {EventType}, Severity: {Severity}, Tenant: {TenantId}, Actor: {ActorId}, IP: {IpAddress}, Description: {Description}",
            eventId,
            request.EventType,
            request.Severity,
            request.TenantId,
            request.ActorId,
            request.IpAddress,
            request.Description);
    }

    private Task TriggerSecurityAlertAsync(RecordSecurityEventCommand request, Guid eventId)
    {
        // In a real implementation, this would:
        // 1. Send notifications to security team
        // 2. Integrate with SIEM systems
        // 3. Create incidents in ticketing systems
        // 4. Send to compliance dashboards

        _logger.LogWarning(
            "SECURITY ALERT: Event {EventId} of type {EventType} with severity {Severity} requires immediate attention. Tenant: {TenantId}",
            eventId,
            request.EventType,
            request.Severity,
            request.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Structured metadata for security events
/// </summary>
internal class SecurityEventMetadata
{
    public string? Severity { get; set; }
    public string? GeoLocation { get; set; }
    public string? TargetResource { get; set; }
    public string? AttemptedAction { get; set; }
    public bool WasBlocked { get; set; }
    public string? CorrelationId { get; set; }
    public string? SessionId { get; set; }
    public string? DeviceFingerprint { get; set; }
    public int? RiskScore { get; set; }
    public List<string>? Tags { get; set; }
    public bool RequiresAlert { get; set; }
    public bool RequiresCompliance { get; set; }
    public string? AdditionalData { get; set; }
}
