namespace Onesign.Modules.NotificationCenter.Application.DTOs;

public class NotificationDeliveryLogDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OutboxItemId { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ProviderMessageId { get; set; }
    public string? ErrorDetails { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Subject { get; set; }
    public string? RecipientAddress { get; set; }
}

public class NotificationDeliveryLogFilterRequest
{
    public Guid? OutboxItemId { get; set; }
    public string? Channel { get; set; }
    public string? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
