using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class AuthenticatePasskeyVerifyCommand : IRequest<Result<LoginResponse>>
{
    public Guid TenantId { get; set; }
    public object AssertionResponse { get; set; } = null!;
    public Guid? ClientId { get; set; }
}
