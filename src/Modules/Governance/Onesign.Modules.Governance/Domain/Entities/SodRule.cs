namespace Onesign.Modules.Governance.Domain.Entities;

public class SodRule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> ConflictingRoles { get; set; } = new();
    public List<string> ConflictingPermissions { get; set; } = new();
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
