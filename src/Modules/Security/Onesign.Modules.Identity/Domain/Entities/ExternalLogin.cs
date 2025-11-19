namespace Onesign.Modules.Identity.Domain.Entities;

public class ExternalLogin
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

