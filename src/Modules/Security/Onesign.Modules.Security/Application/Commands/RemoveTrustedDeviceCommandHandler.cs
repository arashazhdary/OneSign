using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Security.Application.Commands;

public class RemoveTrustedDeviceCommandHandler : IRequestHandler<RemoveTrustedDeviceCommand, Result<bool>>
{
    private readonly ITrustedDeviceRepository _trustedDeviceRepository;
    private readonly ILogger<RemoveTrustedDeviceCommandHandler> _logger;

    public RemoveTrustedDeviceCommandHandler(
        ITrustedDeviceRepository trustedDeviceRepository,
        ILogger<RemoveTrustedDeviceCommandHandler> logger)
    {
        _trustedDeviceRepository = trustedDeviceRepository;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemoveTrustedDeviceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            if (request.UserId == Guid.Empty)
            {
                return Result.Failure<bool>("INVALID_USER_ID", "User ID cannot be empty");
            }

            if (request.DeviceId == Guid.Empty)
            {
                return Result.Failure<bool>("INVALID_DEVICE_ID", "Device ID cannot be empty");
            }

            var device = await _trustedDeviceRepository.GetByIdAsync(request.DeviceId, cancellationToken);
            if (device == null)
            {
                return Result.Failure<bool>("DEVICE_NOT_FOUND", "Trusted device not found");
            }

            // Verify that the device belongs to the user
            if (device.TenantUserId != request.UserId)
            {
                return Result.Failure<bool>("UNAUTHORIZED", "Device does not belong to this user");
            }

            await _trustedDeviceRepository.DeleteAsync(device.Id, cancellationToken);

            _logger.LogInformation(
                "Trusted device removed. UserId: {UserId}, DeviceId: {DeviceId}",
                request.UserId,
                request.DeviceId);

            return Result.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing trusted device {DeviceId} for user {UserId}",
                request.DeviceId, request.UserId);
            return Result.Failure<bool>("REMOVE_DEVICE_FAILED", "Failed to remove trusted device");
        }
    }
}
