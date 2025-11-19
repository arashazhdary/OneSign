using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Services;

public interface ILoginHookExecutor
{
    Task<LoginHookResult> ExecutePreLoginHooksAsync(
        Guid tenantId,
        LoginHookContext context,
        CancellationToken cancellationToken = default);

    Task<LoginHookResult> ExecutePostLoginHooksAsync(
        Guid tenantId,
        LoginHookContext context,
        CancellationToken cancellationToken = default);
}

public class LoginHookContext
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public Dictionary<string, object> Claims { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class LoginHookResult
{
    public bool IsSuccess { get; set; }
    public bool ShouldContinue { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> ModifiedClaims { get; set; } = new();
    public Dictionary<string, object> AdditionalMetadata { get; set; } = new();
}
