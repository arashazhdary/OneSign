using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class ProcessLifecycleEventCommand : IRequest<Result<bool>>
{
    public Guid EventId { get; set; }
}
