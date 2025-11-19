using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Application.Commands;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Application.Services;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Application.Handlers;

public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, IncidentDto>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly DbContext _dbContext;
    private readonly ILogger<CreateIncidentCommandHandler> _logger;

    public CreateIncidentCommandHandler(
        IIncidentRepository repository,
        IIncidentEventRepository eventRepository,
        DbContext dbContext,
        ILogger<CreateIncidentCommandHandler> logger)
    {
        _repository = repository;
        _eventRepository = eventRepository;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IncidentDto> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Severity = request.Severity,
            Status = IncidentStatus.New,
            DetectionSource = request.DetectionSource,
            PrimaryUserId = request.PrimaryUserId,
            PrimaryAppId = request.PrimaryAppId,
            AffectedUsersCount = request.AffectedUsersCount,
            AffectedAppsCount = request.AffectedAppsCount,
            DetectedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(incident, cancellationToken);

        if (request.InitialEvents.Count > 0)
        {
            var events = request.InitialEvents.Select(e => new IncidentEvent
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                EventType = e.EventType,
                EventData = e.EventData,
                Timestamp = e.Timestamp,
                SourceModule = e.SourceModule
            });
            await _eventRepository.AddManyAsync(events, cancellationToken);
        }

        if (request.RelatedEntities.Count > 0)
        {
            var entities = request.RelatedEntities.Select(e => new IncidentLinkedEntity
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                EntityType = (int)e.EntityType,
                EntityId = e.EntityId,
                EntityName = e.EntityName,
                Role = (int)e.Role
            });
            await _dbContext.Set<IncidentLinkedEntity>().AddRangeAsync(entities, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation("Created incident {IncidentId} for tenant {TenantId}", incident.Id, request.TenantId);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class UpdateIncidentCommandHandler : IRequestHandler<UpdateIncidentCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<UpdateIncidentCommandHandler> _logger;

    public UpdateIncidentCommandHandler(
        IIncidentRepository repository,
        ILogger<UpdateIncidentCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(UpdateIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for update", request.Id);
            return null;
        }

        incident.Title = request.Title;
        incident.Description = request.Description;
        incident.Category = request.Category;
        incident.Severity = request.Severity;
        incident.AffectedUsersCount = request.AffectedUsersCount;
        incident.AffectedAppsCount = request.AffectedAppsCount;
        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        _logger.LogInformation("Updated incident {IncidentId}", incident.Id);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class AcknowledgeIncidentCommandHandler : IRequestHandler<AcknowledgeIncidentCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly ILogger<AcknowledgeIncidentCommandHandler> _logger;

    public AcknowledgeIncidentCommandHandler(
        IIncidentRepository repository,
        IIncidentNoteRepository noteRepository,
        ILogger<AcknowledgeIncidentCommandHandler> logger)
    {
        _repository = repository;
        _noteRepository = noteRepository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(AcknowledgeIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for acknowledgment", request.Id);
            return null;
        }

        incident.Status = IncidentStatus.Acknowledged;
        incident.AcknowledgedAt = DateTime.UtcNow;
        incident.AcknowledgedByUserId = request.AcknowledgedByUserId;
        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        if (!string.IsNullOrEmpty(request.Note))
        {
            var note = new IncidentNote
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                Content = request.Note,
                CreatedByUserId = request.AcknowledgedByUserId,
                CreatedAt = DateTime.UtcNow
            };
            await _noteRepository.AddAsync(note, cancellationToken);
        }

        _logger.LogInformation("Acknowledged incident {IncidentId} by user {UserId}", incident.Id, request.AcknowledgedByUserId);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class AssignIncidentCommandHandler : IRequestHandler<AssignIncidentCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly ILogger<AssignIncidentCommandHandler> _logger;

    public AssignIncidentCommandHandler(
        IIncidentRepository repository,
        IIncidentNoteRepository noteRepository,
        ILogger<AssignIncidentCommandHandler> logger)
    {
        _repository = repository;
        _noteRepository = noteRepository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(AssignIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for assignment", request.Id);
            return null;
        }

        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        var assignmentNote = $"Incident assigned to user {request.AssignToUserId}";
        if (!string.IsNullOrEmpty(request.Note))
        {
            assignmentNote += $". Note: {request.Note}";
        }

        var note = new IncidentNote
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            Content = assignmentNote,
            CreatedByUserId = request.AssignedByUserId,
            CreatedAt = DateTime.UtcNow
        };
        await _noteRepository.AddAsync(note, cancellationToken);

        _logger.LogInformation("Assigned incident {IncidentId} to user {AssignToUserId}", incident.Id, request.AssignToUserId);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class UpdateIncidentStatusCommandHandler : IRequestHandler<UpdateIncidentStatusCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly ILogger<UpdateIncidentStatusCommandHandler> _logger;

    public UpdateIncidentStatusCommandHandler(
        IIncidentRepository repository,
        IIncidentNoteRepository noteRepository,
        ILogger<UpdateIncidentStatusCommandHandler> logger)
    {
        _repository = repository;
        _noteRepository = noteRepository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(UpdateIncidentStatusCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for status update", request.Id);
            return null;
        }

        var previousStatus = incident.Status;
        incident.Status = request.Status;
        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        var statusNote = $"Status changed from {previousStatus} to {request.Status}";
        if (!string.IsNullOrEmpty(request.Note))
        {
            statusNote += $". Note: {request.Note}";
        }

        var note = new IncidentNote
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            Content = statusNote,
            CreatedByUserId = request.UpdatedByUserId,
            CreatedAt = DateTime.UtcNow
        };
        await _noteRepository.AddAsync(note, cancellationToken);

        _logger.LogInformation("Updated incident {IncidentId} status from {PreviousStatus} to {NewStatus}", incident.Id, previousStatus, request.Status);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class ResolveIncidentCommandHandler : IRequestHandler<ResolveIncidentCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<ResolveIncidentCommandHandler> _logger;

    public ResolveIncidentCommandHandler(
        IIncidentRepository repository,
        ILogger<ResolveIncidentCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(ResolveIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for resolution", request.Id);
            return null;
        }

        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = DateTime.UtcNow;
        incident.ResolvedByUserId = request.ResolvedByUserId;
        incident.ResolutionSummary = request.ResolutionSummary;
        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        _logger.LogInformation("Resolved incident {IncidentId} by user {UserId}", incident.Id, request.ResolvedByUserId);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class CloseIncidentCommandHandler : IRequestHandler<CloseIncidentCommand, IncidentDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly ILogger<CloseIncidentCommandHandler> _logger;

    public CloseIncidentCommandHandler(
        IIncidentRepository repository,
        IIncidentNoteRepository noteRepository,
        ILogger<CloseIncidentCommandHandler> logger)
    {
        _repository = repository;
        _noteRepository = noteRepository;
        _logger = logger;
    }

    public async Task<IncidentDto?> Handle(CloseIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for closure", request.Id);
            return null;
        }

        incident.Status = IncidentStatus.Closed;
        incident.ClosedAt = DateTime.UtcNow;
        incident.ClosedByUserId = request.ClosedByUserId;
        incident.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(incident, cancellationToken);

        if (!string.IsNullOrEmpty(request.FinalNote))
        {
            var note = new IncidentNote
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                Content = request.FinalNote,
                CreatedByUserId = request.ClosedByUserId,
                CreatedAt = DateTime.UtcNow
            };
            await _noteRepository.AddAsync(note, cancellationToken);
        }

        _logger.LogInformation("Closed incident {IncidentId} by user {UserId}", incident.Id, request.ClosedByUserId);

        return MapToDto(incident);
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class AddIncidentNoteCommandHandler : IRequestHandler<AddIncidentNoteCommand, IncidentNoteDto?>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly ILogger<AddIncidentNoteCommandHandler> _logger;

    public AddIncidentNoteCommandHandler(
        IIncidentRepository incidentRepository,
        IIncidentNoteRepository noteRepository,
        ILogger<AddIncidentNoteCommandHandler> logger)
    {
        _incidentRepository = incidentRepository;
        _noteRepository = noteRepository;
        _logger = logger;
    }

    public async Task<IncidentNoteDto?> Handle(AddIncidentNoteCommand request, CancellationToken cancellationToken)
    {
        var incident = await _incidentRepository.GetByIdAsync(request.IncidentId, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for adding note", request.IncidentId);
            return null;
        }

        var note = new IncidentNote
        {
            Id = Guid.NewGuid(),
            IncidentId = request.IncidentId,
            Content = request.Content,
            CreatedByUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _noteRepository.AddAsync(note, cancellationToken);

        _logger.LogInformation("Added note to incident {IncidentId}", request.IncidentId);

        return new IncidentNoteDto
        {
            Id = note.Id,
            IncidentId = note.IncidentId,
            Content = note.Content,
            CreatedByUserId = note.CreatedByUserId,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}

public class LinkEntityToIncidentCommandHandler : IRequestHandler<LinkEntityToIncidentCommand, IncidentEntityDto?>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly DbContext _dbContext;
    private readonly ILogger<LinkEntityToIncidentCommandHandler> _logger;

    public LinkEntityToIncidentCommandHandler(
        IIncidentRepository incidentRepository,
        DbContext dbContext,
        ILogger<LinkEntityToIncidentCommandHandler> logger)
    {
        _incidentRepository = incidentRepository;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IncidentEntityDto?> Handle(LinkEntityToIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _incidentRepository.GetByIdAsync(request.IncidentId, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for linking entity", request.IncidentId);
            return null;
        }

        var entity = new IncidentLinkedEntity
        {
            Id = Guid.NewGuid(),
            IncidentId = request.IncidentId,
            EntityType = (int)request.EntityType,
            EntityId = request.EntityId,
            EntityName = request.EntityName,
            Role = (int)request.Role
        };

        await _dbContext.Set<IncidentLinkedEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Linked entity {EntityId} to incident {IncidentId}", request.EntityId, request.IncidentId);

        return new IncidentEntityDto
        {
            Id = entity.Id,
            IncidentId = entity.IncidentId,
            EntityType = request.EntityType,
            EntityId = entity.EntityId,
            EntityName = entity.EntityName,
            Role = request.Role
        };
    }
}

public class RunPlaybookOnIncidentCommandHandler : IRequestHandler<RunPlaybookOnIncidentCommand, IncidentPlaybookRunDto?>
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentPlaybookService _playbookService;
    private readonly ILogger<RunPlaybookOnIncidentCommandHandler> _logger;

    public RunPlaybookOnIncidentCommandHandler(
        IIncidentRepository incidentRepository,
        IIncidentPlaybookService playbookService,
        ILogger<RunPlaybookOnIncidentCommandHandler> logger)
    {
        _incidentRepository = incidentRepository;
        _playbookService = playbookService;
        _logger = logger;
    }

    public async Task<IncidentPlaybookRunDto?> Handle(RunPlaybookOnIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _incidentRepository.GetByIdAsync(request.IncidentId, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for running playbook", request.IncidentId);
            return null;
        }

        var run = await _playbookService.ExecutePlaybookAsync(
            request.IncidentId,
            request.WorkflowId,
            request.WorkflowName,
            request.Parameters,
            cancellationToken);

        _logger.LogInformation("Started playbook {WorkflowId} on incident {IncidentId}", request.WorkflowId, request.IncidentId);

        return new IncidentPlaybookRunDto
        {
            Id = run.Id,
            IncidentId = run.IncidentId,
            WorkflowId = run.WorkflowId,
            WorkflowName = run.WorkflowName,
            Status = run.Status,
            StartedAt = run.StartedAt,
            CompletedAt = run.CompletedAt,
            Result = run.Result
        };
    }
}
