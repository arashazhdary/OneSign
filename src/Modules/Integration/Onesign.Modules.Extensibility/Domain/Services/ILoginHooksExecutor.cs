using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Services;

public interface ILoginHooksExecutor
{
    Task<LoginHookResult> ExecuteHooksAsync(Guid tenantId, HookStage stage, Dictionary<string, object> context, CancellationToken cancellationToken = default);
}

