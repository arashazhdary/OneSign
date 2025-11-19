using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class DisableTenantUserCommand : IRequest<Result<TenantUserDto>>
{
    public Guid TenantUserId { get; set; }
    public Guid TenantId { get; set; }
}

