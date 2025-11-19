namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

public class NotificationDeliveryLogEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OutboxItemId { get; set; }
    public int Channel { get; set; }
    public int Status { get; set; }
    public string? ProviderMessageId { get; set; }
    public string? ErrorDetails { get; set; }
    public DateTime Timestamp { get; set; }

    public NotificationOutboxItemEntity? OutboxItem { get; set; }
}
