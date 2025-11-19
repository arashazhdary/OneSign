namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

public class SecuritySignalEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? SessionId { get; set; }
    public int SignalType { get; set; }
    public int RiskScore { get; set; }
    public string DetailsJson { get; set; } = "{}";
    public DateTime DetectedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ActionTaken { get; set; }
}
