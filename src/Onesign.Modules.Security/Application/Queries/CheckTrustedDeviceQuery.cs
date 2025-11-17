using MediatR;

namespace Onesign.Modules.Security.Application.Queries;

public class CheckTrustedDeviceQuery : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = string.Empty;
}
