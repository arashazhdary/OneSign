namespace Onesign.Modules.Applications.Application.DTOs;

public class ClientSecretDto
{
    public Guid Id { get; set; }
    public Guid ApplicationClientId { get; set; }
    public string? Secret { get; set; } // Only returned when creating, never stored
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

