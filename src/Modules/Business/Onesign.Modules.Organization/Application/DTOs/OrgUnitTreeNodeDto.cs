using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Application.DTOs;

public class OrgUnitTreeNodeDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int Level { get; set; }
    public OrgUnitStatus Status { get; set; }
    public List<OrgUnitTreeNodeDto> Children { get; set; } = new();
}

