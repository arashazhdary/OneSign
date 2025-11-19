using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetSecuritySignalsQuery : IRequest<Result<List<SecuritySignalDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public SecuritySignalType? SignalType { get; set; }
    public int Limit { get; set; } = 100;
}
