namespace Onesign.Modules.Organization.Application.DTOs;

public class UpdateOrgUnitRequest
{
    public string Name { get; set; } = string.Empty;
    public int? SortOrder { get; set; }
}

