using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Entities;

public class NotificationTemplate
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TemplateKey { get; set; } = string.Empty; // e.g., "user.created", "mfa.enabled"
    public string Name { get; set; } = string.Empty;
    public TemplateCategory Category { get; set; }
    public NotificationChannel Channel { get; set; }
    public string Locale { get; set; } = "en"; // en, fa

    // Template content
    public string SubjectTemplate { get; set; } = string.Empty; // for Email/InApp
    public string BodyTemplate { get; set; } = string.Empty;

    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
