using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RevokeAllOtherSessionsCommand : IRequest<Result>
{
    public Guid TenantUserId { get; set; }
    public string CurrentSessionToken { get; set; } = string.Empty;
}
