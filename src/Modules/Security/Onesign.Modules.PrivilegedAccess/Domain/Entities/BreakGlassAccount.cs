namespace Onesign.Modules.PrivilegedAccess.Domain.Entities;

public class BreakGlassAccount
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string AllowedTenantsJson { get; set; } = "[]";
    public string AllowedRolesJson { get; set; } = "[]";
    public DateTime? LastUsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
