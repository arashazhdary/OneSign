using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using System.Text.Json;

namespace Onesign.Modules.Incidents.Application.Services;

public class IncidentDetectionService : IIncidentDetectionService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly ILogger<IncidentDetectionService> _logger;

    public IncidentDetectionService(
        IIncidentRepository incidentRepository,
        IIncidentEventRepository eventRepository,
        ILogger<IncidentDetectionService> logger)
    {
        _incidentRepository = incidentRepository;
        _eventRepository = eventRepository;
        _logger = logger;
    }

    public async Task<Incident?> DetectIncidentFromEventsAsync(Guid tenantId, IEnumerable<IncidentEvent> events, CancellationToken ct = default)
    {
        var eventList = events.ToList();
        if (eventList.Count == 0)
            return null;

        var detectionResult = AnalyzeEvents(eventList);
        if (!detectionResult.ShouldCreateIncident)
            return null;

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Title = detectionResult.Title,
            Description = detectionResult.Description,
            Category = detectionResult.Category,
            Severity = detectionResult.Severity,
            Status = IncidentStatus.New,
            DetectionSource = DetectionSource.Automation,
            PrimaryUserId = detectionResult.PrimaryUserId,
            PrimaryAppId = detectionResult.PrimaryAppId,
            AffectedUsersCount = detectionResult.AffectedUsersCount,
            AffectedAppsCount = detectionResult.AffectedAppsCount,
            DetectedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _incidentRepository.AddAsync(incident, ct);

        foreach (var evt in eventList)
        {
            evt.IncidentId = incident.Id;
        }
        await _eventRepository.AddManyAsync(eventList, ct);

        _logger.LogInformation("Auto-detected incident {IncidentId} with category {Category} and severity {Severity}",
            incident.Id, incident.Category, incident.Severity);

        return incident;
    }

    public async Task<List<Incident>> ScanForIncidentsAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var detectedIncidents = new List<Incident>();

        var bruteForceIncident = await DetectBruteForceAttackAsync(tenantId, from, to, ct);
        if (bruteForceIncident != null)
            detectedIncidents.Add(bruteForceIncident);

        var compromisedAccountIncident = await DetectCompromisedAccountAsync(tenantId, from, to, ct);
        if (compromisedAccountIncident != null)
            detectedIncidents.Add(compromisedAccountIncident);

        var privilegedMisuseIncident = await DetectPrivilegedAccessMisuseAsync(tenantId, from, to, ct);
        if (privilegedMisuseIncident != null)
            detectedIncidents.Add(privilegedMisuseIncident);

        _logger.LogInformation("Scanned for incidents in tenant {TenantId} from {From} to {To}, detected {Count} incidents",
            tenantId, from, to, detectedIncidents.Count);

        return detectedIncidents;
    }

    public Task<bool> ShouldCreateIncidentAsync(Guid tenantId, string eventType, string eventData, CancellationToken ct = default)
    {
        var criticalEventTypes = new[]
        {
            "FailedLoginAttempt",
            "SuspiciousLocationLogin",
            "PrivilegedAccessEscalation",
            "DataExfiltrationAttempt",
            "CredentialCompromise",
            "UnauthorizedAccessAttempt"
        };

        if (criticalEventTypes.Contains(eventType))
        {
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(eventData);
                if (data != null)
                {
                    if (data.TryGetValue("riskScore", out var riskScore) && riskScore.GetInt32() >= 80)
                        return Task.FromResult(true);

                    if (data.TryGetValue("severity", out var severity) &&
                        (severity.GetString() == "Critical" || severity.GetString() == "High"))
                        return Task.FromResult(true);
                }
            }
            catch (JsonException)
            {
                _logger.LogWarning("Failed to parse event data for event type {EventType}", eventType);
            }
        }

        return Task.FromResult(false);
    }

    private DetectionResult AnalyzeEvents(List<IncidentEvent> events)
    {
        var result = new DetectionResult();

        var eventTypes = events.Select(e => e.EventType).Distinct().ToList();

        if (eventTypes.Contains("FailedLoginAttempt"))
        {
            var failedLoginCount = events.Count(e => e.EventType == "FailedLoginAttempt");
            if (failedLoginCount >= 5)
            {
                result.ShouldCreateIncident = true;
                result.Category = IncidentCategory.BruteForceAttack;
                result.Severity = failedLoginCount >= 20 ? IncidentSeverity.Critical : IncidentSeverity.High;
                result.Title = $"Brute Force Attack Detected - {failedLoginCount} failed attempts";
                result.Description = $"Multiple failed login attempts detected. {failedLoginCount} failed attempts within a short time window.";
            }
        }
        else if (eventTypes.Contains("SuspiciousLocationLogin"))
        {
            result.ShouldCreateIncident = true;
            result.Category = IncidentCategory.SuspiciousActivity;
            result.Severity = IncidentSeverity.High;
            result.Title = "Suspicious Location Login Detected";
            result.Description = "Login attempt detected from an unusual or suspicious location.";
        }
        else if (eventTypes.Contains("PrivilegedAccessEscalation"))
        {
            result.ShouldCreateIncident = true;
            result.Category = IncidentCategory.PrivilegedAccessMisuse;
            result.Severity = IncidentSeverity.Critical;
            result.Title = "Privileged Access Escalation Detected";
            result.Description = "Unauthorized privilege escalation attempt detected.";
        }
        else if (eventTypes.Contains("DataExfiltrationAttempt"))
        {
            result.ShouldCreateIncident = true;
            result.Category = IncidentCategory.DataExfiltration;
            result.Severity = IncidentSeverity.Critical;
            result.Title = "Data Exfiltration Attempt Detected";
            result.Description = "Potential data exfiltration activity detected.";
        }

        result.AffectedUsersCount = events
            .Where(e => e.EventData.Contains("userId"))
            .Select(e => ExtractUserId(e.EventData))
            .Distinct()
            .Count();

        result.AffectedAppsCount = events
            .Where(e => e.EventData.Contains("applicationId"))
            .Select(e => ExtractAppId(e.EventData))
            .Distinct()
            .Count();

        var firstEvent = events.OrderBy(e => e.Timestamp).First();
        result.PrimaryUserId = ExtractUserId(firstEvent.EventData);
        result.PrimaryAppId = ExtractAppId(firstEvent.EventData);

        return result;
    }

    private async Task<Incident?> DetectBruteForceAttackAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        await Task.CompletedTask;
        return null;
    }

    private async Task<Incident?> DetectCompromisedAccountAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        await Task.CompletedTask;
        return null;
    }

    private async Task<Incident?> DetectPrivilegedAccessMisuseAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        await Task.CompletedTask;
        return null;
    }

    private Guid? ExtractUserId(string eventData)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(eventData);
            if (data != null && data.TryGetValue("userId", out var userId))
            {
                return Guid.Parse(userId.GetString() ?? string.Empty);
            }
        }
        catch
        {
            // Ignore parsing errors
        }
        return null;
    }

    private Guid? ExtractAppId(string eventData)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(eventData);
            if (data != null && data.TryGetValue("applicationId", out var appId))
            {
                return Guid.Parse(appId.GetString() ?? string.Empty);
            }
        }
        catch
        {
            // Ignore parsing errors
        }
        return null;
    }

    private class DetectionResult
    {
        public bool ShouldCreateIncident { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IncidentCategory Category { get; set; }
        public IncidentSeverity Severity { get; set; }
        public Guid? PrimaryUserId { get; set; }
        public Guid? PrimaryAppId { get; set; }
        public int AffectedUsersCount { get; set; }
        public int AffectedAppsCount { get; set; }
    }
}
