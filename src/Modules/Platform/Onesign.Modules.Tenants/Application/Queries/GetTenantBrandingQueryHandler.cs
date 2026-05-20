using System.Text.Json;
using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantBrandingQueryHandler : IRequestHandler<GetTenantBrandingQuery, TenantBrandingDto?>
{
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GetTenantBrandingQueryHandler(ITenantConfigRepository tenantConfigRepository)
    {
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<TenantBrandingDto?> Handle(GetTenantBrandingQuery request, CancellationToken cancellationToken)
    {
        var config = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (config == null)
        {
            return null;
        }

        var branding = new TenantBrandingDto
        {
            UpdatedAt = new DateTimeOffset(
                config.UpdatedAt ?? config.CreatedAt,
                TimeSpan.Zero),
            LogoUrl = config.LogoUrl,
            LogoDarkUrl = config.LogoDarkUrl,
            FaviconUrl = config.FaviconUrl,
            PrimaryColor = config.PrimaryColor,
            SecondaryColor = config.SecondaryColor,
            AccentColor = config.AccentColor,
            TenantName = config.TenantName,
            WelcomeTitle = config.WelcomeTitle,
            WelcomeSubtitle = config.WelcomeSubtitle,
            FooterText = config.FooterText
        };

        // Deserialize JSON fields
        if (!string.IsNullOrEmpty(config.LoginPageConfigJson))
        {
            try
            {
                branding.LoginPageConfig = JsonSerializer.Deserialize<LoginPageConfigDto>(
                    config.LoginPageConfigJson, JsonOptions);
            }
            catch
            {
                branding.LoginPageConfig = GetDefaultLoginPageConfig();
            }
        }
        else
        {
            branding.LoginPageConfig = GetDefaultLoginPageConfig();
        }

        if (!string.IsNullOrEmpty(config.FeaturesJson))
        {
            try
            {
                branding.Features = JsonSerializer.Deserialize<BrandingFeaturesDto>(
                    config.FeaturesJson, JsonOptions);
            }
            catch
            {
                branding.Features = GetDefaultFeatures();
            }
        }
        else
        {
            branding.Features = GetDefaultFeatures();
        }

        return branding;
    }

    private static LoginPageConfigDto GetDefaultLoginPageConfig()
    {
        return new LoginPageConfigDto
        {
            BackgroundType = "slider",
            ShowLogo = true,
            Layout = "split",
            FormPosition = "right",
            SliderAutoPlay = true,
            SliderInterval = 5000,
            GradientStart = "#6366f1",
            GradientEnd = "#8b5cf6",
            SliderImages = new List<SliderImageDto>
            {
                new()
                {
                    Id = "default-1",
                    Url = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80",
                    Title = "Enterprise Security",
                    Description = "Protect your organization with world-class identity management",
                    Order = 0
                },
                new()
                {
                    Id = "default-2",
                    Url = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80",
                    Title = "Seamless Integration",
                    Description = "Connect all your applications with single sign-on",
                    Order = 1
                },
                new()
                {
                    Id = "default-3",
                    Url = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
                    Title = "Global Access",
                    Description = "Secure authentication from anywhere in the world",
                    Order = 2
                }
            }
        };
    }

    private static BrandingFeaturesDto GetDefaultFeatures()
    {
        return new BrandingFeaturesDto
        {
            ShowSocialLogin = true,
            ShowRememberMe = true,
            ShowLanguageSwitcher = true,
            AllowRegistration = true
        };
    }
}
