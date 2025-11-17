namespace Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

public class ExternalLoginEntity
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

