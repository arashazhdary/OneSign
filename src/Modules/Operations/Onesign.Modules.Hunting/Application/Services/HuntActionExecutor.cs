using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Shared.Email;

namespace Onesign.Modules.Hunting.Application.Services;

public class HuntActionExecutor : IHuntActionExecutor
{
    private readonly IEmailService _emailService;
    private readonly ILogger<HuntActionExecutor> _logger;

    public HuntActionExecutor(
        IEmailService emailService,
        ILogger<HuntActionExecutor> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<HuntActionResult> ExecuteActionsAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        HuntActionConfigDto config,
        CancellationToken cancellationToken = default)
    {
        var result = new HuntActionResult();

        _logger.LogInformation(
            "Executing actions for hunt run {HuntRunId} with {MatchCount} matches",
            huntRun.Id, huntRun.MatchCount);

        // Create finding if configured
        if (config.CreateFinding)
        {
            try
            {
                result.FindingCreated = await CreateFindingAsync(huntRun, scheduledHunt, config, cancellationToken);
                _logger.LogInformation("Finding created for hunt run {HuntRunId}", huntRun.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create finding for hunt run {HuntRunId}", huntRun.Id);
                result.Errors.Add($"Failed to create finding: {ex.Message}");
            }
        }

        // Create incident if configured
        if (config.CreateIncident)
        {
            try
            {
                result.IncidentId = await CreateIncidentAsync(huntRun, scheduledHunt, config, cancellationToken);
                _logger.LogInformation("Incident {IncidentId} created for hunt run {HuntRunId}", result.IncidentId, huntRun.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create incident for hunt run {HuntRunId}", huntRun.Id);
                result.Errors.Add($"Failed to create incident: {ex.Message}");
            }
        }

        // Trigger workflow if configured
        if (config.TriggerWorkflowId.HasValue)
        {
            try
            {
                result.TriggeredWorkflowId = await TriggerWorkflowAsync(huntRun, scheduledHunt, config.TriggerWorkflowId.Value, cancellationToken);
                _logger.LogInformation("Workflow {WorkflowId} triggered for hunt run {HuntRunId}", result.TriggeredWorkflowId, huntRun.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to trigger workflow for hunt run {HuntRunId}", huntRun.Id);
                result.Errors.Add($"Failed to trigger workflow: {ex.Message}");
            }
        }

        // Send email notifications if configured
        if (config.NotifyEmails != null && config.NotifyEmails.Count > 0)
        {
            foreach (var email in config.NotifyEmails)
            {
                try
                {
                    await SendNotificationEmailAsync(huntRun, scheduledHunt, email, config.NotificationMessage, cancellationToken);
                    result.NotifiedEmails.Add(email);
                    _logger.LogInformation("Notification sent to {Email} for hunt run {HuntRunId}", email, huntRun.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send notification to {Email} for hunt run {HuntRunId}", email, huntRun.Id);
                    result.Errors.Add($"Failed to notify {email}: {ex.Message}");
                }
            }
        }

        return result;
    }

    private Task<bool> CreateFindingAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        HuntActionConfigDto config,
        CancellationToken cancellationToken)
    {
        // In a real implementation, this would create a finding in the Identity Insights module
        // For now, we simulate the creation
        _logger.LogDebug(
            "Creating finding for hunt {HuntName} with category {Category}",
            scheduledHunt.Name, config.FindingCategory);

        return Task.FromResult(true);
    }

    private Task<Guid> CreateIncidentAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        HuntActionConfigDto config,
        CancellationToken cancellationToken)
    {
        // In a real implementation, this would create an incident in the Incident module
        // For now, we simulate the creation
        var incidentId = Guid.NewGuid();

        _logger.LogDebug(
            "Creating incident for hunt {HuntName} with severity {Severity}, title: {Title}",
            scheduledHunt.Name, config.IncidentSeverity, config.IncidentTitle);

        return Task.FromResult(incidentId);
    }

    private Task<Guid> TriggerWorkflowAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        Guid workflowId,
        CancellationToken cancellationToken)
    {
        // In a real implementation, this would trigger a workflow in the Automation module
        // For now, we simulate the trigger
        _logger.LogDebug(
            "Triggering workflow {WorkflowId} for hunt {HuntName}",
            workflowId, scheduledHunt.Name);

        return Task.FromResult(workflowId);
    }

    private async Task SendNotificationEmailAsync(
        HuntRun huntRun,
        ScheduledHunt scheduledHunt,
        string email,
        string? customMessage,
        CancellationToken cancellationToken)
    {
        var subject = $"Hunt Alert: {scheduledHunt.Name} - {huntRun.MatchCount} matches found";

        var body = $@"
<html>
<body>
<h2>Hunt Alert</h2>
<p>The scheduled hunt <strong>{scheduledHunt.Name}</strong> has completed with findings.</p>

<h3>Summary</h3>
<ul>
    <li><strong>Hunt Name:</strong> {scheduledHunt.Name}</li>
    <li><strong>Run ID:</strong> {huntRun.Id}</li>
    <li><strong>Matches Found:</strong> {huntRun.MatchCount}</li>
    <li><strong>Started:</strong> {huntRun.StartedAt:yyyy-MM-dd HH:mm:ss} UTC</li>
    <li><strong>Completed:</strong> {huntRun.CompletedAt:yyyy-MM-dd HH:mm:ss} UTC</li>
</ul>

{(string.IsNullOrWhiteSpace(customMessage) ? "" : $"<h3>Additional Information</h3><p>{customMessage}</p>")}

<p>Please review the findings in the Identity Analytics & Hunting workspace.</p>

<hr />
<p style=""color: gray; font-size: 12px;"">This is an automated notification from OneSign Identity Platform.</p>
</body>
</html>";

        await _emailService.SendEmailAsync(email, subject, body, isHtml: true, cancellationToken);
    }
}
