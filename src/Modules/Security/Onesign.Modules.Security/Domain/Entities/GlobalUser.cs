namespace Onesign.Modules.Security.Domain.Entities;

/// <summary>
/// Minimal GlobalUser entity for Security module use
/// </summary>
public class GlobalUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
