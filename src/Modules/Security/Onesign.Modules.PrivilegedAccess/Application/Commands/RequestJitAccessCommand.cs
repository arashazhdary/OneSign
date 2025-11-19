using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Commands;

public class RequestJitAccessCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public int DurationMinutes { get; set; }
    public string Justification { get; set; } = string.Empty;
}
