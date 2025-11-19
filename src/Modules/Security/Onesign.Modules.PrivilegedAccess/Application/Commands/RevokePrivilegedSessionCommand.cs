using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class RevokePrivilegedSessionCommand : IRequest<Result<bool>>
{
    public Guid SessionId { get; set; }
    public Guid RevokedBy { get; set; }
}
