namespace Onesign.Modules.AdaptiveSecurity.Application.DTOs;

public class UpdateUserSecurityContextRequest
{
    public Guid UserId { get; set; }
    public string? LastLoginLocation { get; set; }
    public string? LastLoginDevice { get; set; }
    public List<string>? TrustedDevices { get; set; }
    public List<string>? TrustedLocations { get; set; }
}
