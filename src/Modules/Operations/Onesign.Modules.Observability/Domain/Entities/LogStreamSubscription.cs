using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Domain.Entities;

public class LogStreamSubscription
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public LogStreamType Type { get; set; }

    public string TargetUrl { get; set; } = string.Empty;
    public string? AuthHeader { get; set; } // For authentication

    // Filter criteria (JSON)
    public string FilterJson { get; set; } = string.Empty; // Categories, severities to stream

    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastPushedAt { get; set; }
}
