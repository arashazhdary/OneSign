using Onesign.Modules.AccountCenter.Domain.Enums;

namespace Onesign.Modules.AccountCenter.Domain.Entities;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
    public Dictionary<string, string> CustomAttributes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
