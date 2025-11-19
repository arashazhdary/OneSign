using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Entities;

public class LoginHook
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public HookStage Stage { get; set; }
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 2;
    public bool FailOpen { get; set; } = true; // true = allow login if hook fails
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
