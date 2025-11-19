namespace Onesign.Modules.Security.Domain.Entities;

public class TrustedDevice
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public string DeviceId { get; private set; }
    public string DeviceName { get; private set; }
    public DateTime FirstSeenAt { get; private set; }
    public DateTime LastSeenAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public TrustedDevice(
        Guid id,
        Guid tenantUserId,
        string deviceId,
        string deviceName,
        DateTime? expiresAt)
    {
        Id = id;
        TenantUserId = tenantUserId;
        DeviceId = deviceId;
        DeviceName = deviceName;
        FirstSeenAt = DateTime.UtcNow;
        LastSeenAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateLastSeen()
    {
        LastSeenAt = DateTime.UtcNow;
    }

    public bool IsExpired()
    {
        if (ExpiresAt == null)
            return false;

        return DateTime.UtcNow > ExpiresAt.Value;
    }
}
