namespace Onesign.Modules.PrivilegedAccess.Application.DTOs;

public class BreakGlassAccountDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public List<Guid> AllowedTenants { get; set; } = new();
    public List<string> AllowedRoles { get; set; } = new();
    public DateTime? LastUsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBreakGlassAccountRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<Guid> AllowedTenants { get; set; } = new();
    public List<string> AllowedRoles { get; set; } = new();
    public bool IsEnabled { get; set; } = true;
}

public class UpdateBreakGlassAccountRequest
{
    public List<Guid>? AllowedTenants { get; set; }
    public List<string>? AllowedRoles { get; set; }
    public bool? IsEnabled { get; set; }
    public string? NewPassword { get; set; }
}
