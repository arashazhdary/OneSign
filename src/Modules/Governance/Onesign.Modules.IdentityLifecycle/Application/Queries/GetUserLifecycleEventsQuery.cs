using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetUserLifecycleEventsQuery : IRequest<Result<List<LifecycleEventDto>>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}
