using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class CreateTenantCommand : IRequest<Result<TenantDto>>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

