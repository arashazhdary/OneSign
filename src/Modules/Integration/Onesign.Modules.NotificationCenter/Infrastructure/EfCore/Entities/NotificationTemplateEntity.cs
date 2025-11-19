using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

public class NotificationTemplateEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Category { get; set; }
    public int Channel { get; set; }
    public string Locale { get; set; } = "en";
    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
