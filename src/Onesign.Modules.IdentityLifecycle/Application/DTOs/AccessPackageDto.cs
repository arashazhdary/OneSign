namespace Onesign.Modules.IdentityLifecycle.Application.DTOs;

public class AccessPackageDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Guid> RoleIds { get; set; } = new();
    public List<Guid> ApplicationIds { get; set; } = new();
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAccessPackageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Guid> RoleIds { get; set; } = new();
    public List<Guid> ApplicationIds { get; set; } = new();
    public bool IsEnabled { get; set; } = true;
}

public class UpdateAccessPackageRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<Guid>? RoleIds { get; set; }
    public List<Guid>? ApplicationIds { get; set; }
    public bool? IsEnabled { get; set; }
}
