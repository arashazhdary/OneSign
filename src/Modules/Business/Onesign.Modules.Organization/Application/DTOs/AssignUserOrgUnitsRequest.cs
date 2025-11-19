namespace Onesign.Modules.Organization.Application.DTOs;

public class AssignUserOrgUnitsRequest
{
    public Guid PrimaryOrgUnitId { get; set; }
    public List<Guid> SecondaryOrgUnitIds { get; set; } = new();
}

