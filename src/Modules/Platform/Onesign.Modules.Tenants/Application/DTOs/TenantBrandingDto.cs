namespace Onesign.Modules.Tenants.Application.DTOs;

/// <summary>
/// Complete tenant branding configuration for login page customization
/// </summary>
public class TenantBrandingDto
{
    public string? LogoUrl { get; set; }
    public string? LogoDarkUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? TenantName { get; set; }
    public string? WelcomeTitle { get; set; }
    public string? WelcomeSubtitle { get; set; }
    public string? FooterText { get; set; }
    public LoginPageConfigDto? LoginPageConfig { get; set; }
    public BrandingFeaturesDto? Features { get; set; }
}

/// <summary>
/// Configuration for login page appearance
/// </summary>
public class LoginPageConfigDto
{
    /// <summary>
    /// Background type: color, gradient, image, or slider
    /// </summary>
    public string BackgroundType { get; set; } = "slider";

    public string? BackgroundColor { get; set; }
    public string? GradientStart { get; set; }
    public string? GradientEnd { get; set; }
    public string? BackgroundImageUrl { get; set; }

    public bool ShowLogo { get; set; } = true;
    public string? Title { get; set; }
    public string? Subtitle { get; set; }

    /// <summary>
    /// Layout type: split, centered, or overlay
    /// </summary>
    public string Layout { get; set; } = "split";

    /// <summary>
    /// Form position: left or right (for split layout)
    /// </summary>
    public string FormPosition { get; set; } = "right";

    /// <summary>
    /// Slider images for the login page background
    /// </summary>
    public List<SliderImageDto>? SliderImages { get; set; }

    public bool SliderAutoPlay { get; set; } = true;
    public int SliderInterval { get; set; } = 5000;
}

/// <summary>
/// Slider image configuration
/// </summary>
public class SliderImageDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Url { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// Feature flags for login page
/// </summary>
public class BrandingFeaturesDto
{
    public bool ShowSocialLogin { get; set; } = true;
    public bool ShowRememberMe { get; set; } = true;
    public bool ShowLanguageSwitcher { get; set; } = true;
    public bool AllowRegistration { get; set; } = true;
}
