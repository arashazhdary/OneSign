using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetApplicationOrgUnitsQuery : IRequest<Result<AssignApplicationOrgUnitsRequest>>
{
    public Guid ApplicationClientId { get; set; }
    public Guid TenantId { get; set; }
}

