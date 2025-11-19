namespace Onesign.Modules.IdentityLifecycle.Application.DTOs;

public class LifecyclePolicyDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? OrgUnitCode { get; set; }
    public string? JobRole { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public List<Guid> AccessPackageIds { get; set; } = new();
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateLifecyclePolicyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? OrgUnitCode { get; set; }
    public string? JobRole { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public List<Guid> AccessPackageIds { get; set; } = new();
    public bool IsEnabled { get; set; } = true;
}

public class UpdateLifecyclePolicyRequest
{
    public string? Name { get; set; }
    public string? OrgUnitCode { get; set; }
    public string? JobRole { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public List<Guid>? AccessPackageIds { get; set; }
    public bool? IsEnabled { get; set; }
}
