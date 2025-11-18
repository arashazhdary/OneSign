namespace Onesign.Modules.Governance.Application.DTOs;

public class CampaignDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalItems { get; set; }
    public int ReviewedItems { get; set; }
}

public class ViolationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public bool Resolved { get; set; }
}
