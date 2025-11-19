using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Entities;

namespace Onesign.Modules.Hunting.Application.Services;

public interface IHuntActionExecutor
{
    Task<HuntActionResult> ExecuteActionsAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        HuntActionConfigDto config,
        CancellationToken cancellationToken = default);
}

public class HuntActionResult
{
    public bool FindingCreated { get; set; }
    public Guid? IncidentId { get; set; }
    public Guid? TriggeredWorkflowId { get; set; }
    public List<string> NotifiedEmails { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
