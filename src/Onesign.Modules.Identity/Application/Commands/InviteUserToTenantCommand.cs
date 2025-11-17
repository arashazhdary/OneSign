using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class InviteUserToTenantCommand : IRequest<Result<TenantUserDto>>
{
    public Guid TenantId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
}

