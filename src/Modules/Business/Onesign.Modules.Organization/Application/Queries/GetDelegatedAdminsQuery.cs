using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetDelegatedAdminsQuery : IRequest<Result<List<DelegatedAdminDto>>>
{
    public Guid TenantId { get; set; }
}

