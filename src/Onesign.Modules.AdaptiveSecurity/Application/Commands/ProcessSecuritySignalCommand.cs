using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class ProcessSecuritySignalCommand : IRequest<Result<SecuritySignalDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? SessionId { get; set; }
    public SecuritySignalType SignalType { get; set; }
    public int RiskScore { get; set; }
    public string DetailsJson { get; set; } = "{}";
}
