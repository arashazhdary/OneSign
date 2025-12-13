using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateTenantBrandingCommand : IRequest<Result<TenantBrandingDto>>
{
    public Guid TenantId { get; set; }
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
