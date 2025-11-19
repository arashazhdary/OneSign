using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class TrustedDeviceEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public DateTime FirstSeenAt { get; set; }
    public DateTime LastSeenAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public static TrustedDeviceEntity FromDomain(TrustedDevice domain)
    {
        return new TrustedDeviceEntity
        {
            Id = domain.Id,
            TenantUserId = domain.TenantUserId,
            DeviceId = domain.DeviceId,
            DeviceName = domain.DeviceName,
            FirstSeenAt = domain.FirstSeenAt,
            LastSeenAt = domain.LastSeenAt,
            ExpiresAt = domain.ExpiresAt,
            CreatedAt = domain.CreatedAt
        };
    }

    public TrustedDevice ToDomain()
    {
        var device = new TrustedDevice(
            Id,
            TenantUserId,
            DeviceId,
            DeviceName,
            ExpiresAt
        );

        typeof(TrustedDevice).GetProperty(nameof(FirstSeenAt))!
            .SetValue(device, FirstSeenAt);
        typeof(TrustedDevice).GetProperty(nameof(LastSeenAt))!
            .SetValue(device, LastSeenAt);
        typeof(TrustedDevice).GetProperty(nameof(CreatedAt))!
            .SetValue(device, CreatedAt);

        return device;
    }
}
