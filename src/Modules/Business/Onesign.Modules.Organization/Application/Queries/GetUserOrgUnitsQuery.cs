using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetUserOrgUnitsQuery : IRequest<Result<AssignUserOrgUnitsRequest>>
{
    public Guid TenantUserId { get; set; }
    public Guid TenantId { get; set; }
}

