namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class UserLoginSessionEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

