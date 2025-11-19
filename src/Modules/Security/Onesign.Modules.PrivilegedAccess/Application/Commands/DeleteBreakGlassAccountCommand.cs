using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class DeleteBreakGlassAccountCommand : IRequest<Result>
{
    public Guid AccountId { get; set; }
}
