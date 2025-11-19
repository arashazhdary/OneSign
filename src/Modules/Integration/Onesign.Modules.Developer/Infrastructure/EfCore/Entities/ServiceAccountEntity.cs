using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

public class ServiceAccountEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ServiceAccountStatus Status { get; set; }
    public string RolesJson { get; set; } = string.Empty; // JSON array
    public DateTime CreatedAt { get; set; }
    public DateTime? LastAccessAt { get; set; }
    public Guid CreatedByUserId { get; set; }

    public ICollection<ApiKeyEntity> ApiKeys { get; set; } = new List<ApiKeyEntity>();
}
