using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

/// <summary>
/// Controller for managing tenant branding and login page customization
/// </summary>
[ApiController]
[Route("api/tenant/branding")]
public class TenantBrandingController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantBrandingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get complete branding configuration for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Complete branding configuration including slider images</returns>
    [HttpGet]
    [ProducesResponseType(typeof(TenantBrandingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantBrandingDto>> GetBranding([FromQuery] Guid tenantId)
    {
        var query = new GetTenantBrandingQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            // Return default branding if not found
            return Ok(GetDefaultBranding());
        }

        return Ok(result);
    }

    /// <summary>
    /// Update complete branding configuration for a tenant
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(TenantBrandingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TenantBrandingDto>> UpdateBranding(
        [FromBody] UpdateTenantBrandingRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new UpdateTenantBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = request.LogoUrl,
            LogoDarkUrl = request.LogoDarkUrl,
            FaviconUrl = request.FaviconUrl,
            PrimaryColor = request.PrimaryColor,
            SecondaryColor = request.SecondaryColor,
            AccentColor = request.AccentColor,
            TenantName = request.TenantName,
            WelcomeTitle = request.WelcomeTitle,
            WelcomeSubtitle = request.WelcomeSubtitle,
            FooterText = request.FooterText,
            LoginPageConfig = request.LoginPageConfig,
            Features = request.Features
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Update only slider images for a tenant
    /// </summary>
    [HttpPut("slider-images")]
    [ProducesResponseType(typeof(TenantBrandingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TenantBrandingDto>> UpdateSliderImages(
        [FromBody] UpdateSliderImagesRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new UpdateSliderImagesCommand
        {
            TenantId = tenantId,
            SliderImages = request.SliderImages
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    private static TenantBrandingDto GetDefaultBranding()
    {
        return new TenantBrandingDto
        {
            PrimaryColor = "#6366f1",
            SecondaryColor = "#8b5cf6",
            AccentColor = "#10b981",
            TenantName = "OneSign",
            WelcomeTitle = "Welcome Back",
            WelcomeSubtitle = "Sign in to continue to your account",
            LoginPageConfig = new LoginPageConfigDto
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
            },
            Features = new BrandingFeaturesDto
            {
                ShowSocialLogin = true,
                ShowRememberMe = true,
                ShowLanguageSwitcher = true,
                AllowRegistration = true,
                EnableRecaptcha = false,
                RecaptchaSiteKey = null
            }
        };
    }
}

/// <summary>
/// Request model for updating tenant branding
/// </summary>
public class UpdateTenantBrandingRequest
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
/// Request model for updating slider images only
/// </summary>
public class UpdateSliderImagesRequest
{
    public List<SliderImageDto>? SliderImages { get; set; }
}
