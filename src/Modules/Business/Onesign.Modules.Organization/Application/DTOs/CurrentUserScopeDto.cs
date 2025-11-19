namespace Onesign.Modules.Organization.Application.DTOs;

public class CurrentUserScopeDto
{
    public Guid UserId { get; set; }
    public bool IsGlobalAdmin { get; set; }
    public List<Guid> RootOrgUnitIds { get; set; } = new();
    public List<Guid> AllowedOrgUnitIds { get; set; } = new();
}
