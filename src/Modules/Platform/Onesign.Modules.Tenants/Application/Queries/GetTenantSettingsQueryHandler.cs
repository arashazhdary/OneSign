using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantSettingsQueryHandler : IRequestHandler<GetTenantSettingsQuery, TenantSettingsDto?>
{
    private readonly ITenantConfigRepository _tenantConfigRepository;

    public GetTenantSettingsQueryHandler(ITenantConfigRepository tenantConfigRepository)
    {
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<TenantSettingsDto?> Handle(GetTenantSettingsQuery request, CancellationToken cancellationToken)
    {
        var config = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (config == null)
        {
            return null;
        }

        return new TenantSettingsDto
        {
            LogoUrl = config.LogoUrl,
            PrimaryColor = config.PrimaryColor
        };
    }
}
