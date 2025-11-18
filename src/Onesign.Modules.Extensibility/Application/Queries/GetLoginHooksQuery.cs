using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Queries;

public class GetLoginHooksQuery : IRequest<Result<List<LoginHookDto>>>
{
    public Guid TenantId { get; set; }
}
