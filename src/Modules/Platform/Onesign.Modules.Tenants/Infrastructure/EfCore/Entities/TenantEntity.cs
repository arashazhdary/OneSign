using Onesign.Modules.Tenants.Domain.Enums;

namespace Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

public class TenantEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TenantStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

