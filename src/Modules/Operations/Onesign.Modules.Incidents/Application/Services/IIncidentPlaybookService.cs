using Onesign.Modules.Incidents.Domain.Entities;

namespace Onesign.Modules.Incidents.Application.Services;

public interface IIncidentPlaybookService
{
    Task<IncidentPlaybookRun> ExecutePlaybookAsync(Guid incidentId, Guid workflowId, string workflowName, Dictionary<string, string> parameters, CancellationToken ct = default);
    Task<IncidentPlaybookRun?> GetPlaybookRunStatusAsync(Guid runId, CancellationToken ct = default);
    Task<List<IncidentPlaybookRun>> GetPlaybookRunsForIncidentAsync(Guid incidentId, CancellationToken ct = default);
    Task CancelPlaybookRunAsync(Guid runId, CancellationToken ct = default);
}
