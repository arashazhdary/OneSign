namespace Onesign.Shared.Tenant;

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public string? TenantSlug { get; set; }
    public bool IsResolved => TenantId.HasValue;
}

