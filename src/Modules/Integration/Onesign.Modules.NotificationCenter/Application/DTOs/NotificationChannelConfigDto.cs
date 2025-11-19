namespace Onesign.Modules.NotificationCenter.Application.DTOs;

public class NotificationChannelConfigDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Channel { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string ConfigurationJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateNotificationChannelConfigRequest
{
    public string Channel { get; set; } = string.Empty;
    public string ConfigurationJson { get; set; } = "{}";
    public bool IsEnabled { get; set; } = true;
}

public class UpdateNotificationChannelConfigRequest
{
    public string? ConfigurationJson { get; set; }
    public bool? IsEnabled { get; set; }
}
