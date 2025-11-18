using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Application.DTOs;

public class ProcessSecuritySignalRequest
{
    public Guid UserId { get; set; }
    public Guid? SessionId { get; set; }
    public SecuritySignalType SignalType { get; set; }
    public int RiskScore { get; set; }
    public string DetailsJson { get; set; } = "{}";
}
