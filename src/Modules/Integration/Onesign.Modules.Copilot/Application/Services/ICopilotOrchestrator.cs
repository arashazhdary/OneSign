using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Services;

public interface ICopilotOrchestrator
{
    Task<Result<CopilotQueryResponse>> ProcessQueryAsync(CopilotQueryRequest request, CancellationToken cancellationToken = default);
}
