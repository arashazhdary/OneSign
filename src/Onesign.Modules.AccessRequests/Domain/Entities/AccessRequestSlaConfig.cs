namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class AccessRequestSlaConfig
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AccessType { get; set; }
    public int ApprovalTimeoutHours { get; set; } = 24;
    public int EscalationAfterHours { get; set; } = 12;
    public int MaxEscalations { get; set; } = 2;
    public Guid? DefaultEscalateTo { get; set; }
    public bool AutoRejectOnTimeout { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
