namespace Onesign.Modules.IdentityLifecycle.Domain.Entities;

public class AccessPackage
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RoleIdsJson { get; set; } = "[]"; // JSON array of role IDs
    public string ApplicationIdsJson { get; set; } = "[]"; // JSON array of app IDs
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
