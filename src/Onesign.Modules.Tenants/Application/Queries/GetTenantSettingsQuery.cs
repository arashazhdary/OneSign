using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantSettingsQuery : IRequest<TenantSettingsDto?>
{
    public Guid TenantId { get; set; }
}
