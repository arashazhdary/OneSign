namespace Onesign.Modules.AccountCenter.Application.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
    public Dictionary<string, string> CustomAttributes { get; set; } = new();
}

public class UserActivityDto
{
    public Guid Id { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
}

public class ActiveSessionDto
{
    public Guid Id { get; set; }
    public string DeviceInfo { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public bool IsActive { get; set; }
}
