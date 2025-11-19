using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Entities;

public class SecuritySignal
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? SessionId { get; set; }
    public SecuritySignalType SignalType { get; set; }
    public int RiskScore { get; set; } // 0-100
    public string DetailsJson { get; set; } = "{}";
    public DateTime DetectedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ActionTaken { get; set; }
}
