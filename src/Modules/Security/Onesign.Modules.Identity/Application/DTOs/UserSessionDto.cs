namespace Onesign.Modules.Identity.Application.DTOs;

public class UserSessionDto
{
    public Guid Id { get; set; }
    public string DeviceType { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string BrowserVersion { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Country { get; set; }
    public DateTime LastActiveAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsCurrentSession { get; set; }
}
