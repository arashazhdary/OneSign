namespace Onesign.Modules.Identity.Domain.Entities;

public class AuthorizationCode
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid TenantUserId { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string RedirectUri { get; set; } = string.Empty;
    public string CodeChallenge { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}

