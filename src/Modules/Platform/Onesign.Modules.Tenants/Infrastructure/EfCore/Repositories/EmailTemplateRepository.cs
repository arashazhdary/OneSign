using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;

/// <summary>
/// Repository implementation for managing email templates
/// </summary>
public class EmailTemplateRepository : IEmailTemplateRepository
{
    private readonly DbContext _dbContext;

    public EmailTemplateRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<EmailTemplate>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<EmailTemplateEntity>()
            .Where(e => e.TenantId == tenantId)
            .OrderBy(e => e.Type)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<EmailTemplate?> GetByTypeAsync(Guid tenantId, string type, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EmailTemplateEntity>()
            .FirstOrDefaultAsync(e => e.TenantId == tenantId && e.Type == type.ToLowerInvariant(), cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<EmailTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EmailTemplateEntity>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(EmailTemplate template, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(template);
        await _dbContext.Set<EmailTemplateEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(EmailTemplate template, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EmailTemplateEntity>()
            .FirstOrDefaultAsync(e => e.Id == template.Id, cancellationToken);

        if (entity != null)
        {
            entity.Name = template.Name;
            entity.Subject = template.Subject;
            entity.Body = template.Body;
            entity.HtmlBody = template.HtmlBody;
            entity.IsEnabled = template.IsEnabled;
            entity.UpdatedAt = template.UpdatedAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EmailTemplateEntity>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<EmailTemplateEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static EmailTemplate MapToDomain(EmailTemplateEntity entity)
    {
        return new EmailTemplate
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Type = entity.Type,
            Name = entity.Name,
            Subject = entity.Subject,
            Body = entity.Body,
            HtmlBody = entity.HtmlBody,
            IsEnabled = entity.IsEnabled,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static EmailTemplateEntity MapToEntity(EmailTemplate domain)
    {
        return new EmailTemplateEntity
        {
            Id = domain.Id,
            TenantId = domain.TenantId,
            Type = domain.Type,
            Name = domain.Name,
            Subject = domain.Subject,
            Body = domain.Body,
            HtmlBody = domain.HtmlBody,
            IsEnabled = domain.IsEnabled,
            CreatedAt = domain.CreatedAt,
            UpdatedAt = domain.UpdatedAt
        };
    }
}
