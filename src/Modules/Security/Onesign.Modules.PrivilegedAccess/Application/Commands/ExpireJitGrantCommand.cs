using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class ExpireJitGrantCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid GrantId { get; set; }
}
