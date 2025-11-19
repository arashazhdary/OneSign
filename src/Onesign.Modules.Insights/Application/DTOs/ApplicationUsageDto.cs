namespace Onesign.Modules.Insights.Application.DTOs;

public class ApplicationUsageDto
{
    public Guid ApplicationId { get; set; }
    public DateOnly Date { get; set; }
    public int UniqueUsers { get; set; }
    public int SignInCount { get; set; }
    public int FailedSignInCount { get; set; }
    public int HighRiskSignInCount { get; set; }
    public decimal SuccessRate { get; set; }
}

public class ApplicationUsageListDto
{
    public Guid TenantId { get; set; }
    public DateOnly Date { get; set; }
    public List<ApplicationUsageDto> Applications { get; set; } = new();
    public int TotalApplications { get; set; }
    public int TotalSignIns { get; set; }
    public int TotalUniqueUsers { get; set; }
}
