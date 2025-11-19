namespace Onesign.Modules.Organization.Application.DTOs;

public class CreateOrgUnitRequest
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int? SortOrder { get; set; }
}

