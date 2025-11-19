namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

public class AccessPackageEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RoleIdsJson { get; set; } = "[]";
    public string ApplicationIdsJson { get; set; } = "[]";
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
