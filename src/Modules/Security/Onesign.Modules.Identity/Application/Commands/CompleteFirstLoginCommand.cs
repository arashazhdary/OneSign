using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class CompleteFirstLoginCommand : IRequest<Result<TenantUserDto>>
{
    public Guid TenantUserId { get; set; }
    public string Password { get; set; } = string.Empty;
}

