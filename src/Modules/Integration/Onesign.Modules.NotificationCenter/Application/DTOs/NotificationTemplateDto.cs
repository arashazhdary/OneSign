namespace Onesign.Modules.NotificationCenter.Application.DTOs;

public class NotificationTemplateDto
{
    public Guid Id { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Locale { get; set; } = string.Empty;
    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}
