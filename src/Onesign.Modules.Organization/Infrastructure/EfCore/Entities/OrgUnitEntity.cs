using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

public class OrgUnitEntity
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

    public OrgUnit ToDomain()
    {
        return new OrgUnit
        {
            Id = Id,
            TenantId = TenantId,
            ParentId = ParentId,
            Name = Name,
            Code = Code,
            Path = Path,
            Level = Level,
            SortOrder = SortOrder,
            Status = Status,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt
        };
    }

    public static OrgUnitEntity FromDomain(OrgUnit orgUnit)
    {
        return new OrgUnitEntity
        {
            Id = orgUnit.Id,
            TenantId = orgUnit.TenantId,
            ParentId = orgUnit.ParentId,
            Name = orgUnit.Name,
            Code = orgUnit.Code,
            Path = orgUnit.Path,
            Level = orgUnit.Level,
            SortOrder = orgUnit.SortOrder,
            Status = orgUnit.Status,
            CreatedAt = orgUnit.CreatedAt,
            UpdatedAt = orgUnit.UpdatedAt
        };
    }
}

