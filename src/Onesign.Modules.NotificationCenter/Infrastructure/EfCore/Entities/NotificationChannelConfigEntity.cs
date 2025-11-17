namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

public class NotificationChannelConfigEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int Channel { get; set; }
    public bool IsEnabled { get; set; }
    public string ConfigurationJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
