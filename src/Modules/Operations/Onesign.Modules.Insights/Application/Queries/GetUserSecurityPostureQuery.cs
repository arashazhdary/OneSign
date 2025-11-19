using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetUserSecurityPostureQuery : IRequest<UserSecurityPostureListDto>
{
    public Guid TenantId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public bool? MfaEnabled { get; set; }
    public int? MinHighRiskEvents { get; set; }
    public int? DaysInactive { get; set; }
}
