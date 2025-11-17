using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Services;

public interface ILoginHooksExecutor
{
    Task<LoginHookResult> ExecuteHooksAsync(Guid tenantId, HookStage stage, Dictionary<string, object> context, CancellationToken cancellationToken = default);
}

public class LoginHookResult
{
    public bool Allow { get; set; } = true;
    public Dictionary<string, object> AdditionalClaims { get; set; } = new();
    public string? DenyReason { get; set; }
}
