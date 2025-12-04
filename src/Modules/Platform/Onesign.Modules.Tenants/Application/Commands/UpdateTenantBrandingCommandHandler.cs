using System.Text.Json;
using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateTenantBrandingCommandHandler : IRequestHandler<UpdateTenantBrandingCommand, Result<TenantBrandingDto>>
{
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public UpdateTenantBrandingCommandHandler(ITenantConfigRepository tenantConfigRepository)
    {
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<Result<TenantBrandingDto>> Handle(UpdateTenantBrandingCommand request, CancellationToken cancellationToken)
    {
        var config = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (config == null)
        {
            // Create new config if not exists
            config = new TenantConfig
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                CreatedAt = DateTime.UtcNow
            };
        }

        // Update basic fields
        config.LogoUrl = request.LogoUrl;
        config.LogoDarkUrl = request.LogoDarkUrl;
        config.FaviconUrl = request.FaviconUrl;
        config.PrimaryColor = request.PrimaryColor;
        config.SecondaryColor = request.SecondaryColor;
        config.AccentColor = request.AccentColor;
        config.TenantName = request.TenantName;
        config.WelcomeTitle = request.WelcomeTitle;
        config.WelcomeSubtitle = request.WelcomeSubtitle;
        config.FooterText = request.FooterText;
        config.UpdatedAt = DateTime.UtcNow;

        // Serialize JSON fields
        if (request.LoginPageConfig != null)
        {
            config.LoginPageConfigJson = JsonSerializer.Serialize(request.LoginPageConfig, JsonOptions);
        }

        if (request.Features != null)
        {
            config.FeaturesJson = JsonSerializer.Serialize(request.Features, JsonOptions);
        }

        await _tenantConfigRepository.UpdateAsync(config, cancellationToken);

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
            LoginPageConfig = request.LoginPageConfig,
            Features = request.Features
        });
    }
}
