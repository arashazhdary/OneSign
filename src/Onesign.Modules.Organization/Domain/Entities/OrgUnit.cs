using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Domain.Entities;

public class OrgUnit
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }  // Optional, reserved for future HR integration
    public string Path { get; set; } = string.Empty;  // e.g., "001/005/023"
    public int Level { get; set; }  // 0 for root
    public int SortOrder { get; set; }
    public OrgUnitStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public void Update(string name, string? code, int sortOrder, OrgUnitStatus status)
    {
        Name = name;
        Code = code;
        SortOrder = sortOrder;
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }
}

