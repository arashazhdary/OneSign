using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class CreateBreakGlassAccountCommand : IRequest<Result<BreakGlassAccountDto>>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<Guid> AllowedTenants { get; set; } = new();
    public List<string> AllowedRoles { get; set; } = new();
    public bool IsEnabled { get; set; } = true;
}
