namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

public class LoginHookEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Stage { get; set; }
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; }
    public bool FailOpen { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
