using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services;

public class CopilotResponseGenerator : ICopilotResponseGenerator
{
    private readonly ILogger<CopilotResponseGenerator> _logger;

    public CopilotResponseGenerator(ILogger<CopilotResponseGenerator> logger)
    {
        _logger = logger;
    }

    public Task<CopilotGeneratedResponse> GenerateResponseAsync(
        string userMessage,
        CopilotContextDto context,
        List<ConversationMessageDto> conversationHistory,
        string locale,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Generating response for context type {ContextType}, locale {Locale}", context.Type, locale);

        var prompt = BuildPrompt(userMessage, context, conversationHistory);
        var response = ProcessPromptAndGenerateResponse(prompt, context, userMessage);

        return Task.FromResult(response);
    }

    private string BuildPrompt(string userMessage, CopilotContextDto context, List<ConversationMessageDto> conversationHistory)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are OneSign Copilot, an AI assistant for identity and access management security.");
        sb.AppendLine();

        // Add context information
        sb.AppendLine($"Current context: {context.Type}");
        if (context.Data.Count > 0)
        {
            sb.AppendLine("Context data:");
            sb.AppendLine(JsonSerializer.Serialize(context.Data, new JsonSerializerOptions { WriteIndented = true }));
        }
        sb.AppendLine();

        // Add conversation history
        if (conversationHistory.Count > 0)
        {
            sb.AppendLine("Previous conversation:");
            foreach (var message in conversationHistory.TakeLast(10))
            {
                sb.AppendLine($"{message.Role}: {message.Content}");
            }
            sb.AppendLine();
        }

        sb.AppendLine($"User: {userMessage}");

        return sb.ToString();
    }

    private CopilotGeneratedResponse ProcessPromptAndGenerateResponse(string prompt, CopilotContextDto context, string userMessage)
    {
        // This is a vendor-agnostic implementation that analyzes the context and generates appropriate responses
        // In a production environment, this would integrate with an AI service provider

        var response = new CopilotGeneratedResponse();
        var suggestedActions = new List<SuggestedActionDto>();

        // Analyze user intent and generate contextual response
        var lowerMessage = userMessage.ToLowerInvariant();

        switch (context.Type)
        {
            case ContextType.Dashboard:
                response.AnswerText = GenerateDashboardResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetDashboardSuggestedActions(context.Data, lowerMessage));
                break;

            case ContextType.Incident:
                response.AnswerText = GenerateIncidentResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetIncidentSuggestedActions(context.Data, lowerMessage));
                break;

            case ContextType.Policy:
                response.AnswerText = GeneratePolicyResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetPolicySuggestedActions(context.Data, lowerMessage));
                break;

            case ContextType.ChangeSet:
                response.AnswerText = GenerateChangeSetResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetChangeSetSuggestedActions(context.Data, lowerMessage));
                break;

            case ContextType.Hunting:
                response.AnswerText = GenerateHuntingResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetHuntingSuggestedActions(context.Data, lowerMessage));
                break;

            case ContextType.Automation:
                response.AnswerText = GenerateAutomationResponse(context.Data, lowerMessage);
                suggestedActions.AddRange(GetAutomationSuggestedActions(context.Data, lowerMessage));
                break;

            default:
                response.AnswerText = GenerateGenericResponse(lowerMessage);
                break;
        }

        response.SuggestedActions = suggestedActions;
        return response;
    }

    private string GenerateDashboardResponse(Dictionary<string, object?> data, string message)
    {
        if (message.Contains("risk") || message.Contains("threat"))
        {
            var riskyUsers = data.TryGetValue("riskyUsers", out var ru) ? ru?.ToString() ?? "0" : "0";
            var riskyApps = data.TryGetValue("riskyApplications", out var ra) ? ra?.ToString() ?? "0" : "0";
            return $"Based on the current security posture, there are {riskyUsers} users and {riskyApps} applications flagged as risky. I recommend reviewing the top risks and taking appropriate action to mitigate potential threats.";
        }

        if (message.Contains("incident") || message.Contains("alert"))
        {
            var activeIncidents = data.TryGetValue("activeIncidents", out var ai) ? ai?.ToString() ?? "0" : "0";
            return $"There are currently {activeIncidents} active incidents requiring attention. Would you like me to help you investigate the most critical ones?";
        }

        if (message.Contains("overview") || message.Contains("summary") || message.Contains("status"))
        {
            var users = data.TryGetValue("totalUsers", out var u) ? u?.ToString() ?? "0" : "0";
            var apps = data.TryGetValue("totalApplications", out var a) ? a?.ToString() ?? "0" : "0";
            var incidents = data.TryGetValue("activeIncidents", out var i) ? i?.ToString() ?? "0" : "0";
            return $"Current environment overview: {users} total users, {apps} applications, and {incidents} active incidents. Your security posture is being continuously monitored.";
        }

        return "I can help you understand your security dashboard. Ask me about risks, incidents, users, or applications, and I'll provide insights and recommendations.";
    }

    private string GenerateIncidentResponse(Dictionary<string, object?> data, string message)
    {
        var title = data.TryGetValue("title", out var t) ? t?.ToString() ?? "this incident" : "this incident";
        var severity = data.TryGetValue("severity", out var s) ? s?.ToString() ?? "Unknown" : "Unknown";

        if (message.Contains("explain") || message.Contains("what happened"))
        {
            return $"The incident '{title}' with {severity} severity involves suspicious activity that requires investigation. I recommend reviewing the associated events and entities to understand the full scope of the incident.";
        }

        if (message.Contains("remediate") || message.Contains("fix") || message.Contains("resolve"))
        {
            return $"To remediate this {severity} severity incident, I recommend: 1) Isolate affected accounts if necessary, 2) Review and revoke suspicious sessions, 3) Run an appropriate playbook, and 4) Document findings for future reference.";
        }

        if (message.Contains("playbook"))
        {
            return $"There are playbooks available for this incident type. Running an automated playbook can help standardize your response and ensure all necessary steps are taken.";
        }

        return $"I'm analyzing incident '{title}' ({severity} severity). I can help you understand what happened, suggest remediation steps, or run an automated playbook. What would you like to do?";
    }

    private string GeneratePolicyResponse(Dictionary<string, object?> data, string message)
    {
        var policyName = data.TryGetValue("policyName", out var pn) ? pn?.ToString() ?? "this policy" : "this policy";

        if (message.Contains("explain") || message.Contains("what does"))
        {
            return $"The policy '{policyName}' defines access control rules that determine what actions users can perform. Each rule consists of conditions and actions that are evaluated when access requests are made.";
        }

        if (message.Contains("match") || message.Contains("affected"))
        {
            var matchCount = data.TryGetValue("matchCount", out var mc) ? mc?.ToString() ?? "0" : "0";
            return $"This policy has matched {matchCount} entities. You can view recent matches to understand how the policy is being applied across your environment.";
        }

        return $"I can help you understand '{policyName}' - its rules, conditions, and how it affects your users and applications. What would you like to know?";
    }

    private string GenerateChangeSetResponse(Dictionary<string, object?> data, string message)
    {
        var name = data.TryGetValue("name", out var n) ? n?.ToString() ?? "this change set" : "this change set";
        var status = data.TryGetValue("status", out var s) ? s?.ToString() ?? "Unknown" : "Unknown";

        if (message.Contains("impact") || message.Contains("affect"))
        {
            return $"To understand the impact of '{name}', I recommend running a simulation. This will show you which users, applications, and policies will be affected before you commit the changes.";
        }

        if (message.Contains("approve") || message.Contains("commit"))
        {
            return $"The change set '{name}' is currently in {status} status. Before committing, ensure you've reviewed all items and run a simulation to verify the expected impact.";
        }

        return $"I can help you understand the change set '{name}' ({status}). Ask me about its impact, or I can help you simulate the changes before committing.";
    }

    private string GenerateHuntingResponse(Dictionary<string, object?> data, string message)
    {
        if (message.Contains("create") || message.Contains("new query"))
        {
            return "I can help you create a new hunting query. Describe what suspicious activity you're looking for, and I'll help you construct an appropriate query.";
        }

        if (message.Contains("schedule"))
        {
            return "Scheduling hunts allows you to automatically run queries on a regular basis and get notified of new findings. Would you like me to help you set up a scheduled hunt?";
        }

        return "I can help you with threat hunting - creating queries, analyzing results, or scheduling automated hunts. What would you like to investigate?";
    }

    private string GenerateAutomationResponse(Dictionary<string, object?> data, string message)
    {
        if (message.Contains("create") || message.Contains("new workflow"))
        {
            return "I can help you create a new automation workflow. Tell me what trigger event you want to respond to and what actions should be taken, and I'll help you set it up.";
        }

        if (message.Contains("execution") || message.Contains("history") || message.Contains("run"))
        {
            return "You can review workflow execution history to see how your automations are performing. This helps identify any issues or opportunities for optimization.";
        }

        return "I can help you manage automation workflows - creating new ones, reviewing executions, or optimizing existing workflows. What would you like to do?";
    }

    private string GenerateGenericResponse(string message)
    {
        return "I'm here to help you with identity and access management security. You can ask me about incidents, policies, changes, threat hunting, or automation workflows.";
    }

    private List<SuggestedActionDto> GetDashboardSuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();

        var activeIncidents = data.TryGetValue("activeIncidents", out var ai) ? Convert.ToInt32(ai ?? 0) : 0;
        if (activeIncidents > 0)
        {
            actions.Add(new SuggestedActionDto
            {
                Type = SuggestedActionType.OpenIncident,
                Label = "View active incidents",
                Parameters = new Dictionary<string, string> { ["filter"] = "active" }
            });
        }

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.CreateHuntDraft,
            Label = "Create threat hunt",
            Parameters = new Dictionary<string, string>()
        });

        return actions;
    }

    private List<SuggestedActionDto> GetIncidentSuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();
        var incidentId = data.TryGetValue("incidentId", out var id) ? id?.ToString() ?? "" : "";

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.RunPlaybook,
            Label = "Run remediation playbook",
            Parameters = new Dictionary<string, string> { ["incidentId"] = incidentId }
        });

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.CreateAutomationDraft,
            Label = "Create automation for similar incidents",
            Parameters = new Dictionary<string, string> { ["incidentId"] = incidentId }
        });

        return actions;
    }

    private List<SuggestedActionDto> GetPolicySuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();
        var policyId = data.TryGetValue("policyId", out var id) ? id?.ToString() ?? "" : "";

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.ExplainPolicy,
            Label = "Explain policy rules",
            Parameters = new Dictionary<string, string> { ["policyId"] = policyId }
        });

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.SimulateChange,
            Label = "Simulate policy changes",
            Parameters = new Dictionary<string, string> { ["policyId"] = policyId }
        });

        return actions;
    }

    private List<SuggestedActionDto> GetChangeSetSuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();
        var changeSetId = data.TryGetValue("changeSetId", out var id) ? id?.ToString() ?? "" : "";

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.SimulateChange,
            Label = "Simulate changes",
            Parameters = new Dictionary<string, string> { ["changeSetId"] = changeSetId }
        });

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.OpenChangeSet,
            Label = "View change details",
            Parameters = new Dictionary<string, string> { ["changeSetId"] = changeSetId }
        });

        return actions;
    }

    private List<SuggestedActionDto> GetHuntingSuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.CreateHuntDraft,
            Label = "Create new hunt query",
            Parameters = new Dictionary<string, string>()
        });

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.OpenHunt,
            Label = "View saved queries",
            Parameters = new Dictionary<string, string>()
        });

        return actions;
    }

    private List<SuggestedActionDto> GetAutomationSuggestedActions(Dictionary<string, object?> data, string message)
    {
        var actions = new List<SuggestedActionDto>();

        actions.Add(new SuggestedActionDto
        {
            Type = SuggestedActionType.CreateAutomationDraft,
            Label = "Create new workflow",
            Parameters = new Dictionary<string, string>()
        });

        return actions;
    }
}
