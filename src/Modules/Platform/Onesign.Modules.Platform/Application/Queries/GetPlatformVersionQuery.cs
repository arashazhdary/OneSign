using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Queries;

public class GetPlatformVersionQuery : IRequest<Result<PlatformVersionDto>>
{
}

public class GetPlatformVersionHistoryQuery : IRequest<Result<PaginatedResultDto<PlatformVersionDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
