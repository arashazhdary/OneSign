using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class UpdateBreakGlassAccountCommand : IRequest<Result<BreakGlassAccountDto>>
{
    public Guid AccountId { get; set; }
    public List<Guid>? AllowedTenants { get; set; }
    public List<string>? AllowedRoles { get; set; }
    public bool? IsEnabled { get; set; }
    public string? NewPassword { get; set; }
}
