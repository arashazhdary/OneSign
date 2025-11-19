namespace Onesign.Modules.Tenants.Domain.Entities;

public class TenantConfig
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

