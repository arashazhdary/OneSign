using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetTenantBrandingQuery : IRequest<TenantBrandingDto?>
{
    public Guid TenantId { get; set; }
}
