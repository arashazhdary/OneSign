using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateBrandingCommand : IRequest<Result<TenantSettingsDto>>
{
    public Guid TenantId { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
}
