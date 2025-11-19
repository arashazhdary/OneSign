using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Application.Services;

public class IncidentTimelineService : IIncidentTimelineService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly DbContext _dbContext;
    private readonly ILogger<IncidentTimelineService> _logger;

    public IncidentTimelineService(
        IIncidentRepository incidentRepository,
        IIncidentEventRepository eventRepository,
        IIncidentNoteRepository noteRepository,
        DbContext dbContext,
        ILogger<IncidentTimelineService> logger)
    {
        _incidentRepository = incidentRepository;
        _eventRepository = eventRepository;
        _noteRepository = noteRepository;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<List<IncidentTimelineItemDto>> BuildTimelineAsync(Guid incidentId, CancellationToken ct = default)
    {
        var timeline = new List<IncidentTimelineItemDto>();

        var incident = await _incidentRepository.GetByIdAsync(incidentId, ct);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for building timeline", incidentId);
            return timeline;
        }

        timeline.Add(new IncidentTimelineItemDto
        {
            Id = Guid.NewGuid(),
            Timestamp = incident.CreatedAt,
            ItemType = "IncidentCreated",
            Title = "Incident Created",
            Description = $"Incident '{incident.Title}' was created with severity {incident.Severity}"
        });

        if (incident.AcknowledgedAt.HasValue)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = Guid.NewGuid(),
                Timestamp = incident.AcknowledgedAt.Value,
                ItemType = "IncidentAcknowledged",
                Title = "Incident Acknowledged",
                Description = "Incident was acknowledged",
                ActorUserId = incident.AcknowledgedByUserId?.ToString()
            });
        }

        if (incident.ResolvedAt.HasValue)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = Guid.NewGuid(),
                Timestamp = incident.ResolvedAt.Value,
                ItemType = "IncidentResolved",
                Title = "Incident Resolved",
                Description = incident.ResolutionSummary ?? "Incident was resolved",
                ActorUserId = incident.ResolvedByUserId?.ToString()
            });
        }

        if (incident.ClosedAt.HasValue)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = Guid.NewGuid(),
                Timestamp = incident.ClosedAt.Value,
                ItemType = "IncidentClosed",
                Title = "Incident Closed",
                Description = "Incident was closed",
                ActorUserId = incident.ClosedByUserId?.ToString()
            });
        }

        var events = await _eventRepository.GetByIncidentAsync(incidentId, ct);
        foreach (var evt in events)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = evt.Id,
                Timestamp = evt.Timestamp,
                ItemType = "Event",
                Title = evt.EventType,
                Description = $"Event from {evt.SourceModule}",
                Data = evt.EventData
            });
        }

        var notes = await _noteRepository.GetByIncidentAsync(incidentId, ct);
        foreach (var note in notes)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = note.Id,
                Timestamp = note.CreatedAt,
                ItemType = "Note",
                Title = "Note Added",
                Description = note.Content,
                ActorUserId = note.CreatedByUserId.ToString()
            });
        }

        var playbookRuns = await _dbContext.Set<IncidentPlaybookRunEntity>()
            .Where(r => r.IncidentId == incidentId)
            .ToListAsync(ct);
        foreach (var run in playbookRuns)
        {
            timeline.Add(new IncidentTimelineItemDto
            {
                Id = run.Id,
                Timestamp = run.StartedAt,
                ItemType = "PlaybookStarted",
                Title = $"Playbook Started: {run.WorkflowName}",
                Description = $"Playbook execution started"
            });

            if (run.CompletedAt.HasValue)
            {
                timeline.Add(new IncidentTimelineItemDto
                {
                    Id = Guid.NewGuid(),
                    Timestamp = run.CompletedAt.Value,
                    ItemType = "PlaybookCompleted",
                    Title = $"Playbook Completed: {run.WorkflowName}",
                    Description = $"Playbook execution completed with status: {run.Status}",
                    Data = run.Result
                });
            }
        }

        return timeline.OrderBy(t => t.Timestamp).ToList();
    }

    public async Task<List<IncidentTimelineItemDto>> BuildTimelineAsync(Guid incidentId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var timeline = await BuildTimelineAsync(incidentId, ct);
        return timeline
            .Where(t => t.Timestamp >= from && t.Timestamp <= to)
            .ToList();
    }
}
