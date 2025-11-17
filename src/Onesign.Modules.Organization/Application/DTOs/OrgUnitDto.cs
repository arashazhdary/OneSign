using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Application.DTOs;

public class OrgUnitDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string Path { get; set; } = string.Empty;
    public int Level { get; set; }
    public int SortOrder { get; set; }
    public OrgUnitStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

