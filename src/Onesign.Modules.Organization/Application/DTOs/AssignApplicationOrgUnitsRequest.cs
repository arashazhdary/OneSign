namespace Onesign.Modules.Organization.Application.DTOs;

public class AssignApplicationOrgUnitsRequest
{
    public List<Guid> OrgUnitIds { get; set; } = new();
}

