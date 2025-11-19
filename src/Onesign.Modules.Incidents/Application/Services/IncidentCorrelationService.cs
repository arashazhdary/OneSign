using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Repositories;

namespace Onesign.Modules.Incidents.Application.Services;

public class IncidentCorrelationService : IIncidentCorrelationService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly ILogger<IncidentCorrelationService> _logger;

    public IncidentCorrelationService(
        IIncidentRepository incidentRepository,
        IIncidentEventRepository eventRepository,
        ILogger<IncidentCorrelationService> logger)
    {
        _incidentRepository = incidentRepository;
        _eventRepository = eventRepository;
        _logger = logger;
    }

    public async Task<List<Incident>> FindRelatedIncidentsAsync(
        Incident incident,
        TimeSpan timeWindow,
        bool includeSameUser,
        bool includeSameApplication,
        bool includeSameCategory,
        CancellationToken ct = default)
    {
        var from = incident.DetectedAt - timeWindow;
        var to = incident.DetectedAt + timeWindow;

        var incidents = await _incidentRepository.GetByDateRangeAsync(incident.TenantId, from, to, ct);

        var relatedIncidents = incidents
            .Where(i => i.Id != incident.Id)
            .Select(i => new
            {
                Incident = i,
                Score = CalculateCorrelationScore(incident, i, includeSameUser, includeSameApplication, includeSameCategory)
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .Select(x => x.Incident)
            .ToList();

        _logger.LogInformation("Found {Count} related incidents for incident {IncidentId}",
            relatedIncidents.Count, incident.Id);

        return relatedIncidents;
    }

    public async Task<List<IncidentEvent>> CorrelateEventsAsync(
        Guid tenantId,
        IEnumerable<IncidentEvent> events,
        CancellationToken ct = default)
    {
        var eventList = events.ToList();
        var correlatedEvents = new List<IncidentEvent>();

        var eventsByType = eventList.GroupBy(e => e.EventType);

        foreach (var group in eventsByType)
        {
            var sortedEvents = group.OrderBy(e => e.Timestamp).ToList();

            for (var i = 0; i < sortedEvents.Count; i++)
            {
                var currentEvent = sortedEvents[i];
                var isCorrelated = false;

                for (var j = i + 1; j < sortedEvents.Count; j++)
                {
                    var nextEvent = sortedEvents[j];
                    var timeDiff = nextEvent.Timestamp - currentEvent.Timestamp;

                    if (timeDiff.TotalMinutes <= 5)
                    {
                        if (!correlatedEvents.Contains(currentEvent))
                            correlatedEvents.Add(currentEvent);
                        if (!correlatedEvents.Contains(nextEvent))
                            correlatedEvents.Add(nextEvent);
                        isCorrelated = true;
                    }
                    else
                    {
                        break;
                    }
                }

                if (!isCorrelated && !correlatedEvents.Contains(currentEvent))
                {
                    if (IsCriticalEventType(currentEvent.EventType))
                    {
                        correlatedEvents.Add(currentEvent);
                    }
                }
            }
        }

        _logger.LogInformation("Correlated {Count} events from {Total} total events",
            correlatedEvents.Count, eventList.Count);

        await Task.CompletedTask;
        return correlatedEvents;
    }

    public Task<double> CalculateCorrelationScoreAsync(
        Incident incident1,
        Incident incident2,
        CancellationToken ct = default)
    {
        var score = CalculateCorrelationScore(incident1, incident2, true, true, true);
        return Task.FromResult(score);
    }

    private double CalculateCorrelationScore(
        Incident incident1,
        Incident incident2,
        bool includeSameUser,
        bool includeSameApplication,
        bool includeSameCategory)
    {
        var score = 0.0;

        if (includeSameUser &&
            incident1.PrimaryUserId.HasValue &&
            incident2.PrimaryUserId.HasValue &&
            incident1.PrimaryUserId == incident2.PrimaryUserId)
        {
            score += 40;
        }

        if (includeSameApplication &&
            incident1.PrimaryAppId.HasValue &&
            incident2.PrimaryAppId.HasValue &&
            incident1.PrimaryAppId == incident2.PrimaryAppId)
        {
            score += 30;
        }

        if (includeSameCategory && incident1.Category == incident2.Category)
        {
            score += 20;
        }

        if (incident1.Severity == incident2.Severity)
        {
            score += 10;
        }

        var timeDiff = Math.Abs((incident1.DetectedAt - incident2.DetectedAt).TotalMinutes);
        if (timeDiff <= 5)
            score += 15;
        else if (timeDiff <= 30)
            score += 10;
        else if (timeDiff <= 60)
            score += 5;

        return Math.Min(score, 100);
    }

    private bool IsCriticalEventType(string eventType)
    {
        var criticalTypes = new[]
        {
            "PrivilegedAccessEscalation",
            "DataExfiltrationAttempt",
            "CredentialCompromise",
            "MalwareDetected",
            "UnauthorizedAccessAttempt"
        };

        return criticalTypes.Contains(eventType);
    }
}
