using MediatR;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Queries;

public class CheckTrustedDeviceQueryHandler : IRequestHandler<CheckTrustedDeviceQuery, bool>
{
    private readonly IDeviceFingerprintService _deviceService;

    public CheckTrustedDeviceQueryHandler(IDeviceFingerprintService deviceService)
    {
        _deviceService = deviceService;
    }

    public async Task<bool> Handle(CheckTrustedDeviceQuery request, CancellationToken cancellationToken)
    {
        return await _deviceService.IsTrustedAsync(
            request.UserId,
            request.DeviceFingerprint,
            cancellationToken
        );
    }
}
