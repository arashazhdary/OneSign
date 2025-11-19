using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Queries;

public class GetActiveJitGrantsQuery : IRequest<Result<List<JitGrantDto>>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}
