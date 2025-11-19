using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class PasswordLoginCommand : IRequest<Result<LoginResponse>>
{
    public Guid TenantId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? ClientId { get; set; }
    public string? DeviceFingerprint { get; set; }
}

