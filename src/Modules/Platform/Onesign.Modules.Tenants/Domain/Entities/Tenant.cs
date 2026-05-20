using Onesign.Modules.Tenants.Domain.Enums;

namespace Onesign.Modules.Tenants.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TenantStatus Status { get; set; }
    /// <summary>
    /// When true, tenant is a non-production developer sandbox (isolated trials).
    /// </summary>
    public bool IsSandbox { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

