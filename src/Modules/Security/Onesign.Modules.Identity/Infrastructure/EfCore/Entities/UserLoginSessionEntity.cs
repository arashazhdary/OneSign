namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class UserLoginSessionEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceType { get; set; }
    public string? DeviceName { get; set; }
    public string? Browser { get; set; }
    public string? BrowserVersion { get; set; }
    public string? OperatingSystem { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? RevokedAt { get; set; }
}

