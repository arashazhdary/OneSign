using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

/// <summary>
/// Query to get incident details by ID
/// </summary>
public class GetIncidentDetailsQuery : IRequest<IncidentDetailDto?>
{
    public Guid TenantId { get; set; }
    public Guid IncidentId { get; set; }
}
