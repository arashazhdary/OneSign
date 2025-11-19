using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateBrandingCommandHandler : IRequestHandler<UpdateBrandingCommand, Result<TenantSettingsDto>>
{
    private readonly ITenantConfigRepository _tenantConfigRepository;

    public UpdateBrandingCommandHandler(ITenantConfigRepository tenantConfigRepository)
    {
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<Result<TenantSettingsDto>> Handle(UpdateBrandingCommand request, CancellationToken cancellationToken)
    {
        var config = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (config == null)
        {
            return Result.Failure<TenantSettingsDto>("TENANT_CONFIG_NOT_FOUND", "Tenant configuration not found");
        }

        config.LogoUrl = request.LogoUrl;
        config.PrimaryColor = request.PrimaryColor;
        await _tenantConfigRepository.UpdateAsync(config, cancellationToken);

        return Result.Success(new TenantSettingsDto
        {
            LogoUrl = config.LogoUrl,
            PrimaryColor = config.PrimaryColor
        });
    }
}
