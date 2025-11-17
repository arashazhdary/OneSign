namespace Onesign.Modules.Identity.Domain.Entities;

public class UserLoginSession
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string SessionToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

