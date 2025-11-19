using MediatR;

namespace Onesign.Modules.Security.Application.Commands;

public class DisableMfaMethodCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }
    public Guid MethodId { get; set; }
}
