namespace Onesign.Modules.Organization.Domain.Services;

public class OrgScope
{
    public List<Guid> AllowedOrgUnitIds { get; set; } = new();
    public bool IsGlobalAdmin { get; set; }
    public List<Guid> RootOrgUnitIds { get; set; } = new();  // Root OrgUnits for delegated admins
}

