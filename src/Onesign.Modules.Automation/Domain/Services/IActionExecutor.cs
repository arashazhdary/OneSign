using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Domain.Services;

public interface IActionExecutor
{
    Task<Result> ExecuteAsync(AutomationAction action, Guid tenantId, Dictionary<string, object?> payload, CancellationToken cancellationToken = default);
}
