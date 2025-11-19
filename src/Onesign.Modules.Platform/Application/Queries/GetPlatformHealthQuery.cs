using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Queries;

public class GetPlatformHealthQuery : IRequest<Result<PlatformHealthDto>>
{
}

public class GetComponentHealthQuery : IRequest<Result<ComponentHealthDto>>
{
    public string ComponentName { get; set; } = string.Empty;
}
