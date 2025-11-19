using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Entities;

public class PolicyTarget
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public PolicyTargetType TargetType { get; set; }
    public string TargetKey { get; set; } = string.Empty;
    public string? TargetName { get; set; }
    public DateTime CreatedAt { get; set; }
}
