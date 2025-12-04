using System.Text.Json;
using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateSliderImagesCommandHandler : IRequestHandler<UpdateSliderImagesCommand, Result<TenantBrandingDto>>
{
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public UpdateSliderImagesCommandHandler(ITenantConfigRepository tenantConfigRepository)
    {
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<Result<TenantBrandingDto>> Handle(UpdateSliderImagesCommand request, CancellationToken cancellationToken)
    {
        var config = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (config == null)
        {
            return Result.Failure<TenantBrandingDto>("TENANT_CONFIG_NOT_FOUND", "Tenant configuration not found");
        }

        // Get existing login page config or create new
        LoginPageConfigDto loginPageConfig;
        if (!string.IsNullOrEmpty(config.LoginPageConfigJson))
        {
            try
            {
                loginPageConfig = JsonSerializer.Deserialize<LoginPageConfigDto>(config.LoginPageConfigJson, JsonOptions)
                    ?? new LoginPageConfigDto();
            }
            catch
            {
                loginPageConfig = new LoginPageConfigDto();
            }
        }
        else
        {
            loginPageConfig = new LoginPageConfigDto();
        }

        // Update slider images
        loginPageConfig.SliderImages = request.SliderImages;

        // Serialize and save
        config.LoginPageConfigJson = JsonSerializer.Serialize(loginPageConfig, JsonOptions);
        config.UpdatedAt = DateTime.UtcNow;

        await _tenantConfigRepository.UpdateAsync(config, cancellationToken);

        // Get features
        BrandingFeaturesDto? features = null;
        if (!string.IsNullOrEmpty(config.FeaturesJson))
        {
            try
            {
                features = JsonSerializer.Deserialize<BrandingFeaturesDto>(config.FeaturesJson, JsonOptions);
            }
            catch { }
        }

        return Result.Success(new TenantBrandingDto
        {
            LogoUrl = config.LogoUrl,
            LogoDarkUrl = config.LogoDarkUrl,
            FaviconUrl = config.FaviconUrl,
            PrimaryColor = config.PrimaryColor,
            SecondaryColor = config.SecondaryColor,
            AccentColor = config.AccentColor,
            TenantName = config.TenantName,
            WelcomeTitle = config.WelcomeTitle,
            WelcomeSubtitle = config.WelcomeSubtitle,
            FooterText = config.FooterText,
            LoginPageConfig = loginPageConfig,
            Features = features
        });
    }
}
