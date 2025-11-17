namespace Onesign.Modules.Identity.Domain.Entities;

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}

