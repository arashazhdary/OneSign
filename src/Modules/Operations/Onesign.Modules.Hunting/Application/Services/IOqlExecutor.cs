using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Services;

public interface IOqlExecutor
{
    Task<Result<HuntResultDto>> ExecuteAsync(
        string scopeType,
        Guid scopeId,
        OqlQueryDto query,
        CancellationToken cancellationToken = default);
}
