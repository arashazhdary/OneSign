using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Queries;

public class GetRiskEventsQuery : IRequest<List<RiskEventDto>>
{
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public int? EventType { get; set; }
    public int? RiskLevel { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
