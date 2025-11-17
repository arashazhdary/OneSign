using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateTenantStatusCommand : IRequest<Result<TenantDto>>
{
    public Guid TenantId { get; set; }
    public TenantStatus Status { get; set; }
}

