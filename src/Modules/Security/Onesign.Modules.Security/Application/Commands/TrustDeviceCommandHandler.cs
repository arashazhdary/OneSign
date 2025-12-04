using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Security.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Security.Application.Commands;

public class TrustDeviceCommandHandler : IRequestHandler<TrustDeviceCommand, Result<Guid>>
{
    private readonly IDeviceFingerprintService _deviceFingerprintService;
    private readonly ILogger<TrustDeviceCommandHandler> _logger;

    public TrustDeviceCommandHandler(
        IDeviceFingerprintService deviceFingerprintService,
        ILogger<TrustDeviceCommandHandler> logger)
    {
        _deviceFingerprintService = deviceFingerprintService;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(TrustDeviceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            if (request.UserId == Guid.Empty)
            {
                return Result.Failure<Guid>("INVALID_USER_ID", "User ID cannot be empty");
            }

            if (string.IsNullOrWhiteSpace(request.DeviceFingerprint))
            {
                return Result.Failure<Guid>("INVALID_DEVICE_FINGERPRINT", "Device fingerprint cannot be empty");
            }

            if (request.RememberDays <= 0 || request.RememberDays > 365)
            {
                return Result.Failure<Guid>("INVALID_REMEMBER_DAYS", "Remember days must be between 1 and 365");
            }

            var deviceName = request.DeviceName ?? "Trusted Device";

            var trustedDevice = await _deviceFingerprintService.MarkDeviceAsTrustedAsync(
                request.UserId,
                request.DeviceFingerprint,
                deviceName,
                request.RememberDays,
                cancellationToken);

            _logger.LogInformation(
                "Device marked as trusted. UserId: {UserId}, DeviceId: {DeviceId}",
                request.UserId,
                trustedDevice.Id);

            return Result.Success(trustedDevice.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error trusting device for user {UserId}", request.UserId);
            return Result.Failure<Guid>("TRUST_DEVICE_FAILED", "Failed to mark device as trusted");
        }
    }
}
