using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class RiskEvent
{
    public Guid Id { get; private set; }
    public Guid? TenantId { get; private set; }
    public Guid? TenantUserId { get; private set; }
    public RiskEventType EventType { get; private set; }
    public RiskLevel RiskLevel { get; private set; }
    public string IpAddress { get; private set; }
    public string Country { get; private set; }
    public string DeviceId { get; private set; }
    public string DetailsJson { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public RiskEvent(
        Guid id,
        Guid? tenantId,
        Guid? tenantUserId,
        RiskEventType eventType,
        RiskLevel riskLevel,
        string ipAddress,
        string country,
        string deviceId,
        string detailsJson)
    {
        Id = id;
        TenantId = tenantId;
        TenantUserId = tenantUserId;
        EventType = eventType;
        RiskLevel = riskLevel;
        IpAddress = ipAddress;
        Country = country;
        DeviceId = deviceId;
        DetailsJson = detailsJson;
        CreatedAt = DateTime.UtcNow;
    }
}
