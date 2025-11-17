namespace Onesign.Modules.Applications.Domain.Entities;

public class ClientRedirectUri
{
    public Guid Id { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string Uri { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

