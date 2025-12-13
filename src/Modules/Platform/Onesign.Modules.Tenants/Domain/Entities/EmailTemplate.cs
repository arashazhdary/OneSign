namespace Onesign.Modules.Tenants.Domain.Entities;

/// <summary>
/// Domain entity representing an email template for a tenant
/// </summary>
public class EmailTemplate
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>
    /// Type of email template (welcome, password_reset, magic_link, mfa_code, account_locked)
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the template
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email subject line (supports variables like {{user.name}})
    /// </summary>
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// Plain text body (for fallback in email clients that don't support HTML)
    /// </summary>
    public string? Body { get; set; }

    /// <summary>
    /// HTML body with rich formatting
    /// </summary>
    public string? HtmlBody { get; set; }

    /// <summary>
    /// Whether this template is enabled
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>
    /// When the template was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the template was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}
