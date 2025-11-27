using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using System.Text.Json;

namespace Onesign.Modules.Incidents.Application.Services;

public class IncidentDetectionService : IIncidentDetectionService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly IAuditEventRepository _auditEventRepository;
    private readonly IRiskEventRepository _riskEventRepository;
    private readonly ILogger<IncidentDetectionService> _logger;

    public IncidentDetectionService(
        IIncidentRepository incidentRepository,
        IIncidentEventRepository eventRepository,
        IAuditEventRepository auditEventRepository,
        IRiskEventRepository riskEventRepository,
        ILogger<IncidentDetectionService> logger)
    {
        _incidentRepository = incidentRepository;
        _eventRepository = eventRepository;
        _auditEventRepository = auditEventRepository;
        _riskEventRepository = riskEventRepository;
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
        // Query audit events for failed login attempts
        var auditEvents = await _auditEventRepository.GetByTenantIdAsync(tenantId, from, to, ct);

        var failedLoginEvents = auditEvents
            .Where(e => e.EventType == AuditEventType.FailedLoginAttempt ||
                       e.EventType == AuditEventType.LoginFailed)
            .ToList();

        if (failedLoginEvents.Count == 0)
            return null;

        // Group by IP address to detect brute force from same IP
        var ipGroups = failedLoginEvents
            .Where(e => !string.IsNullOrEmpty(e.IpAddress))
            .GroupBy(e => e.IpAddress)
            .Select(g => new { IpAddress = g.Key, Count = g.Count(), Events = g.ToList() })
            .Where(g => g.Count >= 5)  // Threshold: 5+ failed attempts from same IP
            .OrderByDescending(g => g.Count)
            .FirstOrDefault();

        // Group by actor (user) to detect brute force on same account
        var userGroups = failedLoginEvents
            .Where(e => e.ActorId.HasValue)
            .GroupBy(e => e.ActorId)
            .Select(g => new { UserId = g.Key, Count = g.Count(), Events = g.ToList() })
            .Where(g => g.Count >= 5)  // Threshold: 5+ failed attempts on same account
            .OrderByDescending(g => g.Count)
            .FirstOrDefault();

        // Determine which pattern is more severe
        var primaryGroup = (ipGroups?.Count ?? 0) > (userGroups?.Count ?? 0) ? ipGroups : userGroups;

        if (primaryGroup == null)
            return null;

        var severity = primaryGroup.Count >= 20 ? IncidentSeverity.Critical :
                      primaryGroup.Count >= 10 ? IncidentSeverity.High : IncidentSeverity.Medium;

        var affectedUsers = failedLoginEvents
            .Where(e => e.ActorId.HasValue)
            .Select(e => e.ActorId!.Value)
            .Distinct()
            .Count();

        var primaryUserId = ipGroups != null
            ? ipGroups.Events.FirstOrDefault(e => e.ActorId.HasValue)?.ActorId
            : userGroups?.UserId;

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Title = ipGroups != null
                ? $"Brute Force Attack from IP {ipGroups.IpAddress} - {primaryGroup.Count} Failed Attempts"
                : $"Brute Force Attack on User Account - {primaryGroup.Count} Failed Attempts",
            Description = ipGroups != null
                ? $"Multiple failed login attempts detected from IP address {ipGroups.IpAddress}. {primaryGroup.Count} failed attempts detected between {from:yyyy-MM-dd HH:mm} and {to:yyyy-MM-dd HH:mm}. This pattern indicates a potential brute force attack attempting to compromise user accounts."
                : $"Multiple failed login attempts detected on user account. {primaryGroup.Count} failed attempts detected between {from:yyyy-MM-dd HH:mm} and {to:yyyy-MM-dd HH:mm}. This pattern indicates a potential brute force attack.",
            Category = IncidentCategory.BruteForceAttack,
            Severity = severity,
            Status = IncidentStatus.New,
            DetectionSource = DetectionSource.Automation,
            PrimaryUserId = primaryUserId,
            AffectedUsersCount = affectedUsers,
            DetectedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _incidentRepository.AddAsync(incident, ct);

        // Create incident events for the detected audit events
        var incidentEvents = primaryGroup.Events.Select(ae => new IncidentEvent
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            EventType = "FailedLoginAttempt",
            EventData = JsonSerializer.Serialize(new
            {
                auditEventId = ae.Id,
                userId = ae.ActorId,
                ipAddress = ae.IpAddress,
                userAgent = ae.UserAgent,
                timestamp = ae.CreatedAt
            }),
            Timestamp = ae.CreatedAt,
            SourceModule = "AuditModule"
        }).ToList();

        if (incidentEvents.Any())
        {
            await _eventRepository.AddManyAsync(incidentEvents, ct);
        }

        _logger.LogWarning("Detected brute force attack in tenant {TenantId}: {Count} failed login attempts. Incident {IncidentId} created with severity {Severity}",
            tenantId, primaryGroup.Count, incident.Id, severity);

        return incident;
    }

    private async Task<Incident?> DetectCompromisedAccountAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        // Query risk events for suspicious patterns
        var riskEvents = await _riskEventRepository.GetByTenantIdAsync(
            tenantId,
            from,
            to,
            riskLevel: null,
            eventType: null,
            tenantUserId: null,
            ct);

        if (riskEvents.Count == 0)
            return null;

        // Look for high-risk events that indicate compromised account
        var suspiciousEvents = riskEvents
            .Where(e => e.RiskLevel == RiskLevel.High &&
                       (e.EventType == RiskEventType.NewDeviceLogin ||
                        e.EventType == RiskEventType.GeoAnomaly ||
                        e.EventType == RiskEventType.SuspiciousActivity))
            .ToList();

        if (suspiciousEvents.Count == 0)
            return null;

        // Group by user to find accounts with multiple suspicious activities
        var userGroups = suspiciousEvents
            .Where(e => e.TenantUserId.HasValue)
            .GroupBy(e => e.TenantUserId)
            .Select(g => new
            {
                UserId = g.Key,
                Count = g.Count(),
                Events = g.ToList(),
                HasGeoAnomaly = g.Any(e => e.EventType == RiskEventType.GeoAnomaly),
                HasNewDevice = g.Any(e => e.EventType == RiskEventType.NewDeviceLogin),
                Countries = g.Select(e => e.Country).Distinct().Count(),
                Devices = g.Select(e => e.DeviceId).Distinct().Count()
            })
            .OrderByDescending(g => g.Count)
            .ToList();

        // Prioritize accounts with multiple risk indicators
        var compromisedAccount = userGroups.FirstOrDefault(g =>
            g.Count >= 2 ||  // Multiple high-risk events
            (g.HasGeoAnomaly && g.HasNewDevice) ||  // Both geo and device anomalies
            g.Countries > 1  // Logins from multiple countries in time window
        );

        if (compromisedAccount == null && suspiciousEvents.Count >= 3)
        {
            // If no specific user pattern but many high-risk events, create general incident
            compromisedAccount = userGroups.FirstOrDefault();
        }

        if (compromisedAccount == null)
            return null;

        var severity = compromisedAccount.Count >= 3 || compromisedAccount.Countries > 2
            ? IncidentSeverity.Critical
            : IncidentSeverity.High;

        var detailsList = new List<string>();
        if (compromisedAccount.HasGeoAnomaly)
            detailsList.Add($"logins from {compromisedAccount.Countries} different countries");
        if (compromisedAccount.HasNewDevice)
            detailsList.Add($"access from {compromisedAccount.Devices} new/unrecognized devices");
        if (suspiciousEvents.Any(e => e.EventType == RiskEventType.SuspiciousActivity))
            detailsList.Add("suspicious activity patterns");

        var details = string.Join(", ", detailsList);

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Title = $"Compromised Account Detected - Multiple Anomalous Login Patterns",
            Description = $"Unusual login patterns detected for user account suggesting potential compromise. The following indicators were identified: {details}. {compromisedAccount.Count} high-risk security events detected between {from:yyyy-MM-dd HH:mm} and {to:yyyy-MM-dd HH:mm}. Immediate investigation and potential credential reset recommended.",
            Category = IncidentCategory.CompromisedAccount,
            Severity = severity,
            Status = IncidentStatus.New,
            DetectionSource = DetectionSource.Automation,
            PrimaryUserId = compromisedAccount.UserId,
            AffectedUsersCount = 1,
            DetectedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _incidentRepository.AddAsync(incident, ct);

        // Create incident events from risk events
        var incidentEvents = compromisedAccount.Events.Select(re => new IncidentEvent
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            EventType = re.EventType.ToString(),
            EventData = JsonSerializer.Serialize(new
            {
                riskEventId = re.Id,
                userId = re.TenantUserId,
                riskLevel = re.RiskLevel.ToString(),
                ipAddress = re.IpAddress,
                country = re.Country,
                deviceId = re.DeviceId,
                details = re.DetailsJson,
                timestamp = re.CreatedAt
            }),
            Timestamp = re.CreatedAt,
            SourceModule = "SecurityModule"
        }).ToList();

        if (incidentEvents.Any())
        {
            await _eventRepository.AddManyAsync(incidentEvents, ct);
        }

        _logger.LogWarning("Detected compromised account in tenant {TenantId} for user {UserId}: {Count} high-risk events including {Details}. Incident {IncidentId} created with severity {Severity}",
            tenantId, compromisedAccount.UserId, compromisedAccount.Count, details, incident.Id, severity);

        return incident;
    }

    private async Task<Incident?> DetectPrivilegedAccessMisuseAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        // Query audit events for privileged actions
        var auditEvents = await _auditEventRepository.GetByTenantIdAsync(tenantId, from, to, ct);

        var privilegedEvents = auditEvents
            .Where(e => e.EventType == AuditEventType.PrivilegeEscalation ||
                       e.EventType == AuditEventType.UnauthorizedAccess ||
                       e.EventType == AuditEventType.ConfigurationChanged ||
                       e.EventType == AuditEventType.SecurityPolicyViolation ||
                       e.EventType == AuditEventType.DelegatedAdminCreated ||
                       e.EventType == AuditEventType.DelegatedAdminRemoved ||
                       e.EventType == AuditEventType.TenantSuspended ||
                       e.EventType == AuditEventType.DataExportRequested ||
                       e.EventType == AuditEventType.DataDeletionRequested)
            .ToList();

        if (privilegedEvents.Count == 0)
            return null;

        // Look for critical privilege escalation or unauthorized access
        var criticalEvents = privilegedEvents
            .Where(e => e.EventType == AuditEventType.PrivilegeEscalation ||
                       e.EventType == AuditEventType.UnauthorizedAccess)
            .ToList();

        if (criticalEvents.Count > 0)
        {
            // Immediate incident for privilege escalation
            var primaryEvent = criticalEvents.First();
            var severity = IncidentSeverity.Critical;

            var incident = new Incident
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Title = $"Privileged Access Misuse Detected - {criticalEvents.Count} Unauthorized Privilege Events",
                Description = $"Critical security event detected: {criticalEvents.Count} privilege escalation or unauthorized access attempts were identified between {from:yyyy-MM-dd HH:mm} and {to:yyyy-MM-dd HH:mm}. This indicates potential misuse of privileged access or attempted unauthorized elevation of permissions. Immediate investigation required.",
                Category = IncidentCategory.PrivilegedAccessMisuse,
                Severity = severity,
                Status = IncidentStatus.New,
                DetectionSource = DetectionSource.Automation,
                PrimaryUserId = primaryEvent.ActorId,
                AffectedUsersCount = criticalEvents.Where(e => e.ActorId.HasValue).Select(e => e.ActorId).Distinct().Count(),
                DetectedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _incidentRepository.AddAsync(incident, ct);

            var incidentEvents = criticalEvents.Select(ae => new IncidentEvent
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                EventType = ae.EventType.ToString(),
                EventData = JsonSerializer.Serialize(new
                {
                    auditEventId = ae.Id,
                    eventType = ae.EventType.ToString(),
                    userId = ae.ActorId,
                    description = ae.Description,
                    ipAddress = ae.IpAddress,
                    userAgent = ae.UserAgent,
                    metadata = ae.Metadata,
                    timestamp = ae.CreatedAt
                }),
                Timestamp = ae.CreatedAt,
                SourceModule = "AuditModule"
            }).ToList();

            await _eventRepository.AddManyAsync(incidentEvents, ct);

            _logger.LogError("Detected privileged access misuse in tenant {TenantId}: {Count} critical privilege events. Incident {IncidentId} created with severity {Severity}",
                tenantId, criticalEvents.Count, incident.Id, severity);

            return incident;
        }

        // Check for patterns of suspicious privileged activity
        var actorGroups = privilegedEvents
            .Where(e => e.ActorId.HasValue)
            .GroupBy(e => e.ActorId)
            .Select(g => new
            {
                UserId = g.Key,
                Count = g.Count(),
                Events = g.ToList(),
                EventTypes = g.Select(e => e.EventType).Distinct().ToList(),
                HasConfigChanges = g.Any(e => e.EventType == AuditEventType.ConfigurationChanged),
                HasPolicyViolation = g.Any(e => e.EventType == AuditEventType.SecurityPolicyViolation),
                HasDelegatedAdminChanges = g.Any(e => e.EventType == AuditEventType.DelegatedAdminCreated ||
                                                      e.EventType == AuditEventType.DelegatedAdminRemoved),
                HasDataOperations = g.Any(e => e.EventType == AuditEventType.DataExportRequested ||
                                              e.EventType == AuditEventType.DataDeletionRequested)
            })
            .Where(g => g.Count >= 3 ||  // Multiple privileged actions
                       (g.EventTypes.Count >= 2 && g.Count >= 2))  // Different types of privileged actions
            .OrderByDescending(g => g.Count)
            .FirstOrDefault();

        if (actorGroups == null)
            return null;

        var eventSeverity = actorGroups.Count >= 5 || actorGroups.HasDataOperations
            ? IncidentSeverity.High
            : IncidentSeverity.Medium;

        var actionTypes = new List<string>();
        if (actorGroups.HasConfigChanges)
            actionTypes.Add("configuration changes");
        if (actorGroups.HasPolicyViolation)
            actionTypes.Add("security policy violations");
        if (actorGroups.HasDelegatedAdminChanges)
            actionTypes.Add("delegated admin modifications");
        if (actorGroups.HasDataOperations)
            actionTypes.Add("data export/deletion requests");

        var actionsDescription = string.Join(", ", actionTypes);

        var privilegeMisuseIncident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Title = $"Unusual Privileged Activity Pattern Detected - {actorGroups.Count} Administrative Actions",
            Description = $"Unusual pattern of privileged administrative actions detected. A user performed {actorGroups.Count} privileged operations including: {actionsDescription} between {from:yyyy-MM-dd HH:mm} and {to:yyyy-MM-dd HH:mm}. This activity pattern deviates from normal administrative behavior and requires review.",
            Category = IncidentCategory.PrivilegedAccessMisuse,
            Severity = eventSeverity,
            Status = IncidentStatus.New,
            DetectionSource = DetectionSource.Automation,
            PrimaryUserId = actorGroups.UserId,
            AffectedUsersCount = 1,
            DetectedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _incidentRepository.AddAsync(privilegeMisuseIncident, ct);

        var privilegeIncidentEvents = actorGroups.Events.Select(ae => new IncidentEvent
        {
            Id = Guid.NewGuid(),
            IncidentId = privilegeMisuseIncident.Id,
            EventType = ae.EventType.ToString(),
            EventData = JsonSerializer.Serialize(new
            {
                auditEventId = ae.Id,
                eventType = ae.EventType.ToString(),
                userId = ae.ActorId,
                description = ae.Description,
                ipAddress = ae.IpAddress,
                userAgent = ae.UserAgent,
                metadata = ae.Metadata,
                timestamp = ae.CreatedAt
            }),
            Timestamp = ae.CreatedAt,
            SourceModule = "AuditModule"
        }).ToList();

        await _eventRepository.AddManyAsync(privilegeIncidentEvents, ct);

        _logger.LogWarning("Detected unusual privileged activity in tenant {TenantId} for user {UserId}: {Count} administrative actions including {Actions}. Incident {IncidentId} created with severity {Severity}",
            tenantId, actorGroups.UserId, actorGroups.Count, actionsDescription, privilegeMisuseIncident.Id, eventSeverity);

        return privilegeMisuseIncident;
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
