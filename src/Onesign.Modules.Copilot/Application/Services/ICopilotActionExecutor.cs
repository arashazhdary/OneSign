using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Services;

public interface ICopilotActionExecutor
{
    Task<Result<ActionExecutionResultDto>> ExecuteActionAsync(
        Guid tenantId,
        Guid userId,
        SuggestedActionType actionType,
        Dictionary<string, string> parameters,
        CancellationToken cancellationToken = default);
}
