using Onesign.Modules.Tenants.Domain.Entities;

namespace Onesign.Modules.Tenants.Domain.Repositories;

/// <summary>
/// Repository interface for managing email templates
/// </summary>
public interface IEmailTemplateRepository
{
    /// <summary>
    /// Get all email templates for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of email templates</returns>
    Task<List<EmailTemplate>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific email template by type for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="type">Template type (welcome, password_reset, magic_link, mfa_code, account_locked)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Email template or null if not found</returns>
    Task<EmailTemplate?> GetByTypeAsync(Guid tenantId, string type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get an email template by ID
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Email template or null if not found</returns>
    Task<EmailTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new email template
    /// </summary>
    /// <param name="template">Email template to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task AddAsync(EmailTemplate template, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing email template
    /// </summary>
    /// <param name="template">Email template to update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task UpdateAsync(EmailTemplate template, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete an email template
    /// </summary>
    /// <param name="id">Template ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
