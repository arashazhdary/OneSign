using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class DeviceFingerprintService : IDeviceFingerprintService
{
    private readonly ITrustedDeviceRepository _trustedDeviceRepository;

    public DeviceFingerprintService(ITrustedDeviceRepository trustedDeviceRepository)
    {
        _trustedDeviceRepository = trustedDeviceRepository ?? throw new ArgumentNullException(nameof(trustedDeviceRepository));
    }

    public async Task<TrustedDevice?> GetTrustedDeviceAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        return await _trustedDeviceRepository.GetByDeviceIdAsync(tenantUserId, deviceId, cancellationToken);
    }

    public async Task<bool> IsTrustedDeviceAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        var device = await _trustedDeviceRepository.GetByDeviceIdAsync(tenantUserId, deviceId, cancellationToken);

        if (device == null)
            return false;

        // Check if device is expired
        if (device.IsExpired())
            return false;

        return true;
    }

    public async Task<TrustedDevice> MarkDeviceAsTrustedAsync(
        Guid tenantUserId,
        string deviceId,
        string deviceName,
        int rememberDays,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        if (string.IsNullOrWhiteSpace(deviceName))
            throw new ArgumentException("DeviceName cannot be null or empty", nameof(deviceName));

        if (rememberDays <= 0)
            throw new ArgumentException("RememberDays must be greater than 0", nameof(rememberDays));

        // Check if device already exists
        var existingDevice = await _trustedDeviceRepository.GetByDeviceIdAsync(
            tenantUserId,
            deviceId,
            cancellationToken);

        if (existingDevice != null)
        {
            // Update existing device's last seen time and expiry
            existingDevice.UpdateLastSeen();

            // Update expiry by creating a new device with updated expiry
            // Since the entity doesn't have an UpdateExpiry method, we'll just update LastSeen
            await _trustedDeviceRepository.UpdateAsync(existingDevice, cancellationToken);

            return existingDevice;
        }

        // Create new trusted device
        var expiresAt = rememberDays > 0
            ? DateTime.UtcNow.AddDays(rememberDays)
            : (DateTime?)null;

        var trustedDevice = new TrustedDevice(
            id: Guid.NewGuid(),
            tenantUserId: tenantUserId,
            deviceId: deviceId,
            deviceName: deviceName,
            expiresAt: expiresAt
        );

        await _trustedDeviceRepository.AddAsync(trustedDevice, cancellationToken);

        return trustedDevice;
    }

    public async Task UpdateDeviceLastSeenAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        var device = await _trustedDeviceRepository.GetByDeviceIdAsync(
            tenantUserId,
            deviceId,
            cancellationToken);

        if (device == null)
        {
            // Device not found, nothing to update
            return;
        }

        device.UpdateLastSeen();
        await _trustedDeviceRepository.UpdateAsync(device, cancellationToken);
    }
}
