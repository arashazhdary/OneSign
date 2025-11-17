using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetOrgUnitDetailsQuery : IRequest<Result<OrgUnitDto>>
{
    public Guid OrgUnitId { get; set; }
    public Guid TenantId { get; set; }
}

