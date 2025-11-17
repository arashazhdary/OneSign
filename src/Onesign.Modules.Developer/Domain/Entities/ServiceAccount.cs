using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Domain.Entities;

public class ServiceAccount
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ServiceAccountStatus Status { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? LastAccessAt { get; set; }
    public Guid CreatedByUserId { get; set; }

    public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
}
