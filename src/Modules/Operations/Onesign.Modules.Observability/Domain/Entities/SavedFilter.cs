namespace Onesign.Modules.Observability.Domain.Entities;

public class SavedFilter
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FilterJson { get; set; } = string.Empty; // Serialized audit search filter

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
