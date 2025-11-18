using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class RevokeJitGrantCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid GrantId { get; set; }
    public Guid RevokedBy { get; set; }
    public string? Reason { get; set; }
}
