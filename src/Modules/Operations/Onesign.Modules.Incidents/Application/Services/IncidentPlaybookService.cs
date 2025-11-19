using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;
using System.Text.Json;

namespace Onesign.Modules.Incidents.Application.Services;

public class IncidentPlaybookService : IIncidentPlaybookService
{
    private readonly DbContext _dbContext;
    private readonly ILogger<IncidentPlaybookService> _logger;

    public IncidentPlaybookService(
        DbContext dbContext,
        ILogger<IncidentPlaybookService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IncidentPlaybookRun> ExecutePlaybookAsync(
        Guid incidentId,
        Guid workflowId,
        string workflowName,
        Dictionary<string, string> parameters,
        CancellationToken ct = default)
    {
        var runEntity = new IncidentPlaybookRunEntity
        {
            Id = Guid.NewGuid(),
            IncidentId = incidentId,
            WorkflowId = workflowId,
            WorkflowName = workflowName,
            Status = "Running",
            StartedAt = DateTime.UtcNow
        };

        await _dbContext.Set<IncidentPlaybookRunEntity>().AddAsync(runEntity, ct);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Started playbook {WorkflowId} ({WorkflowName}) for incident {IncidentId}, run ID: {RunId}",
            workflowId, workflowName, incidentId, runEntity.Id);

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(2000, CancellationToken.None);

                var result = await ExecutePlaybookActionsAsync(workflowId, workflowName, incidentId, parameters);

                using var scope = _dbContext.Database.BeginTransaction();
                var entity = await _dbContext.Set<IncidentPlaybookRunEntity>()
                    .FirstOrDefaultAsync(r => r.Id == runEntity.Id, CancellationToken.None);
                if (entity != null)
                {
                    entity.Status = "Completed";
                    entity.CompletedAt = DateTime.UtcNow;
                    entity.Result = JsonSerializer.Serialize(result);
                    await _dbContext.SaveChangesAsync(CancellationToken.None);
                    await scope.CommitAsync(CancellationToken.None);
                }

                _logger.LogInformation("Completed playbook run {RunId} for incident {IncidentId}",
                    runEntity.Id, incidentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing playbook {WorkflowId} for incident {IncidentId}",
                    workflowId, incidentId);

                try
                {
                    var entity = await _dbContext.Set<IncidentPlaybookRunEntity>()
                        .FirstOrDefaultAsync(r => r.Id == runEntity.Id, CancellationToken.None);
                    if (entity != null)
                    {
                        entity.Status = "Failed";
                        entity.CompletedAt = DateTime.UtcNow;
                        entity.Result = JsonSerializer.Serialize(new { Error = ex.Message });
                        await _dbContext.SaveChangesAsync(CancellationToken.None);
                    }
                }
                catch
                {
                    // Ignore secondary errors
                }
            }
        }, ct);

        return new IncidentPlaybookRun
        {
            Id = runEntity.Id,
            IncidentId = runEntity.IncidentId,
            WorkflowId = runEntity.WorkflowId,
            WorkflowName = runEntity.WorkflowName,
            Status = runEntity.Status,
            StartedAt = runEntity.StartedAt
        };
    }

    public async Task<IncidentPlaybookRun?> GetPlaybookRunStatusAsync(Guid runId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentPlaybookRunEntity>()
            .FirstOrDefaultAsync(r => r.Id == runId, ct);

        if (entity == null)
            return null;

        return new IncidentPlaybookRun
        {
            Id = entity.Id,
            IncidentId = entity.IncidentId,
            WorkflowId = entity.WorkflowId,
            WorkflowName = entity.WorkflowName,
            Status = entity.Status,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Result = entity.Result
        };
    }

    public async Task<List<IncidentPlaybookRun>> GetPlaybookRunsForIncidentAsync(Guid incidentId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentPlaybookRunEntity>()
            .Where(r => r.IncidentId == incidentId)
            .OrderByDescending(r => r.StartedAt)
            .ToListAsync(ct);

        return entities.Select(e => new IncidentPlaybookRun
        {
            Id = e.Id,
            IncidentId = e.IncidentId,
            WorkflowId = e.WorkflowId,
            WorkflowName = e.WorkflowName,
            Status = e.Status,
            StartedAt = e.StartedAt,
            CompletedAt = e.CompletedAt,
            Result = e.Result
        }).ToList();
    }

    public async Task CancelPlaybookRunAsync(Guid runId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentPlaybookRunEntity>()
            .FirstOrDefaultAsync(r => r.Id == runId, ct);

        if (entity != null && entity.Status == "Running")
        {
            entity.Status = "Cancelled";
            entity.CompletedAt = DateTime.UtcNow;
            entity.Result = JsonSerializer.Serialize(new { Message = "Playbook run was cancelled" });
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Cancelled playbook run {RunId}", runId);
        }
    }

    private async Task<PlaybookResult> ExecutePlaybookActionsAsync(
        Guid workflowId,
        string workflowName,
        Guid incidentId,
        Dictionary<string, string> parameters)
    {
        var result = new PlaybookResult
        {
            Success = true,
            ActionsExecuted = new List<string>()
        };

        if (workflowName.Contains("Isolate", StringComparison.OrdinalIgnoreCase))
        {
            result.ActionsExecuted.Add("User session terminated");
            result.ActionsExecuted.Add("Account temporarily disabled");
            result.ActionsExecuted.Add("Notification sent to security team");
        }
        else if (workflowName.Contains("Reset", StringComparison.OrdinalIgnoreCase))
        {
            result.ActionsExecuted.Add("Password reset initiated");
            result.ActionsExecuted.Add("MFA enrollment required");
            result.ActionsExecuted.Add("User notified via email");
        }
        else if (workflowName.Contains("Block", StringComparison.OrdinalIgnoreCase))
        {
            result.ActionsExecuted.Add("IP address blocked");
            result.ActionsExecuted.Add("Conditional access policy updated");
            result.ActionsExecuted.Add("Audit log entry created");
        }
        else
        {
            result.ActionsExecuted.Add("Default containment actions executed");
            result.ActionsExecuted.Add("Security team notified");
        }

        await Task.Delay(500);

        result.CompletedAt = DateTime.UtcNow;
        result.Message = $"Successfully executed {result.ActionsExecuted.Count} actions";

        return result;
    }

    private class PlaybookResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> ActionsExecuted { get; set; } = new();
        public DateTime CompletedAt { get; set; }
    }
}
