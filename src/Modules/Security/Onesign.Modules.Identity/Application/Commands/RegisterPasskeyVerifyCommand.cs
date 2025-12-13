using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class RegisterPasskeyVerifyCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string Email { get; set; } = string.Empty;
    public object AttestationResponse { get; set; } = null!;
    public string? DeviceName { get; set; }
}
