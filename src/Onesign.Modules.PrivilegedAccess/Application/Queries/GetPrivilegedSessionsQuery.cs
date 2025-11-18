using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Queries;

public class GetPrivilegedSessionsQuery : IRequest<Result<List<PrivilegedSessionDto>>>
{
    public Guid TenantId { get; set; }
    public bool ActiveOnly { get; set; } = true;
}
