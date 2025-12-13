namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class MagicLinkTokenEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}
