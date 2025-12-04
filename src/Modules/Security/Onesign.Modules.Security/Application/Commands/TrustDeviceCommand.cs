using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Security.Application.Commands;

public class TrustDeviceCommand : IRequest<Result<Guid>>
{
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = string.Empty;
    public string? DeviceName { get; set; }
    public int RememberDays { get; set; } = 30;
}
