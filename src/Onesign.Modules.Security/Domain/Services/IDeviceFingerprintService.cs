using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Services;

public interface IDeviceFingerprintService
{
    Task<TrustedDevice?> GetTrustedDeviceAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default);

    Task<bool> IsTrustedDeviceAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default);

    Task<TrustedDevice> MarkDeviceAsTrustedAsync(
        Guid tenantUserId,
        string deviceId,
        string deviceName,
        int rememberDays,
        CancellationToken cancellationToken = default);

    Task UpdateDeviceLastSeenAsync(
        Guid tenantUserId,
        string deviceId,
        CancellationToken cancellationToken = default);
}
