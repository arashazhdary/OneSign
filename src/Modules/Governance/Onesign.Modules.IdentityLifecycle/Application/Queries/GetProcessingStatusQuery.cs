using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetProcessingStatusQuery : IRequest<Result<ProcessingStatusDto>>
{
    public Guid TenantId { get; set; }
}
