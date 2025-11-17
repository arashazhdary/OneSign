using Onesign.Modules.AccountCenter.Domain.Enums;

namespace Onesign.Modules.AccountCenter.Domain.Entities;

public class UserActivity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public ActivityType ActivityType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public DateTime OccurredAt { get; set; }
    public Dictionary<string, string> Metadata { get; set; } = new();
}
