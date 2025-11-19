namespace Onesign.Modules.ChangeManagement.Application.DTOs;

public class SimulationResultDto
{
    public int ImpactedUsersCount { get; set; }
    public int ImpactedAppsCount { get; set; }
    public int PrivilegedUsersAffectedCount { get; set; }
    public List<string> PoliciesAffected { get; set; } = new();
    public List<string> AutomationWorkflowsAffected { get; set; } = new();
    public string RiskDirection { get; set; } = "Neutral";
    public List<string> Warnings { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}
