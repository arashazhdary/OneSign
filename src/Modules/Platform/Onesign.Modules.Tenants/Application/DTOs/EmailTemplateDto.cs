namespace Onesign.Modules.Tenants.Application.DTOs;

/// <summary>
/// Email template configuration
/// </summary>
public class EmailTemplateDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? HtmlBody { get; set; }
    public bool IsEnabled { get; set; } = true;
}

/// <summary>
/// Request to update an email template
/// </summary>
public class UpdateEmailTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? HtmlBody { get; set; }
    public bool IsEnabled { get; set; } = true;
}

/// <summary>
/// Request to preview an email template
/// </summary>
public class PreviewEmailTemplateRequest
{
    public string Email { get; set; } = string.Empty;
    public Dictionary<string, string>? Variables { get; set; }
}

/// <summary>
/// Request to send a test email
/// </summary>
public class SendTestEmailRequest
{
    public string Email { get; set; } = string.Empty;
}
