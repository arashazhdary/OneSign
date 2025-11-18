namespace Onesign.Modules.IdentityLifecycle.Domain.Entities;

public class LifecyclePolicy
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? OrgUnitCode { get; set; }
    public string? JobRole { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public string AccessPackageIdsJson { get; set; } = "[]"; // JSON array of package IDs
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
