using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class RiskEventEntity
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? TenantUserId { get; set; }
    public RiskEventType EventType { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
    public string DetailsJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static RiskEventEntity FromDomain(RiskEvent domain)
    {
        return new RiskEventEntity
        {
            Id = domain.Id,
            TenantId = domain.TenantId,
            TenantUserId = domain.TenantUserId,
            EventType = domain.EventType,
            RiskLevel = domain.RiskLevel,
            IpAddress = domain.IpAddress,
            Country = domain.Country,
            DeviceId = domain.DeviceId,
            DetailsJson = domain.DetailsJson,
            CreatedAt = domain.CreatedAt
        };
    }

    public RiskEvent ToDomain()
    {
        var riskEvent = new RiskEvent(
            Id,
            TenantId,
            TenantUserId,
            EventType,
            RiskLevel,
            IpAddress,
            Country,
            DeviceId,
            DetailsJson
        );

        typeof(RiskEvent).GetProperty(nameof(CreatedAt))!
            .SetValue(riskEvent, CreatedAt);

        return riskEvent;
    }
}
