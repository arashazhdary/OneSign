namespace Onesign.Modules.Applications.Domain.Entities;

public class ClientSecret
{
    public Guid Id { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string SecretHash { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

