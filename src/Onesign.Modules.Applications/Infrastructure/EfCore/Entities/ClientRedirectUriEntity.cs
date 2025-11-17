namespace Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

public class ClientRedirectUriEntity
{
    public Guid Id { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string Uri { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

