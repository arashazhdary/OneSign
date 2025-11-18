using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetLifecycleEventsQuery : IRequest<Result<List<LifecycleEventDto>>>
{
    public Guid TenantId { get; set; }
    public string? Status { get; set; }
}
