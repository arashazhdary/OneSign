namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

public class UserProfileEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredLanguage { get; set; }
    public string CustomAttributesJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
