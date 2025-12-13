namespace Onesign.Modules.Tenants.Domain.Entities;

public class TenantConfig
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    // Logo and basic branding
    public string? LogoUrl { get; set; }
    public string? LogoDarkUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }

    // Tenant display info
    public string? TenantName { get; set; }
    public string? WelcomeTitle { get; set; }
    public string? WelcomeSubtitle { get; set; }
    public string? FooterText { get; set; }

    // Login page configuration (stored as JSON)
    public string? LoginPageConfigJson { get; set; }

    // Feature flags (stored as JSON)
    public string? FeaturesJson { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
