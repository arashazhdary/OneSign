namespace Onesign.Modules.IdentityInsights.Application.DTOs;

public class ZombieAccountDto
{
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public DateTime? LastLoginAt { get; set; }
    public int DaysSinceLogin { get; set; }
    public int ApplicationsCount { get; set; }
    public int PrivilegedRolesCount { get; set; }
    public bool MfaEnabled { get; set; }
}
