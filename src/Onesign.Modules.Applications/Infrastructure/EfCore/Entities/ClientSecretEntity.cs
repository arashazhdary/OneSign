using Onesign.Modules.Applications.Domain.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

public class ClientSecretEntity
{
    public Guid Id { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string SecretHash { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public ClientSecret ToDomain()
    {
        return new ClientSecret
        {
            Id = Id,
            ApplicationClientId = ApplicationClientId,
            SecretHash = SecretHash,
            ExpiresAt = ExpiresAt,
            CreatedAt = CreatedAt
        };
    }

    public static ClientSecretEntity FromDomain(ClientSecret domain)
    {
        return new ClientSecretEntity
        {
            Id = domain.Id,
            ApplicationClientId = domain.ApplicationClientId,
            SecretHash = domain.SecretHash,
            ExpiresAt = domain.ExpiresAt,
            CreatedAt = domain.CreatedAt
        };
    }
}

