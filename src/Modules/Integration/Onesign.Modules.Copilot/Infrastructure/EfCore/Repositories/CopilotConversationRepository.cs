using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Copilot.Domain.Entities;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Copilot.Domain.Repositories;
using Onesign.Modules.Copilot.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Copilot.Infrastructure.EfCore.Repositories;

public class CopilotConversationRepository : ICopilotConversationRepository
{
    private readonly OnesignDbContext _dbContext;

    public CopilotConversationRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CopilotConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<CopilotConversationEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<CopilotConversation?> GetByIdWithMessagesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<CopilotConversationEntity>()
            .Include(x => x.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithMessages(entity) : null;
    }

    public async Task<IReadOnlyList<CopilotConversation>> GetByUserIdAsync(Guid tenantId, Guid userId, int limit, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<CopilotConversationEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.LastMessageAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<CopilotConversation?> GetLatestByUserIdAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<CopilotConversationEntity>()
            .Include(x => x.Messages.OrderBy(m => m.CreatedAt))
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.LastMessageAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity != null ? MapToDomainWithMessages(entity) : null;
    }

    public async Task AddAsync(CopilotConversation conversation, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(conversation);
        await _dbContext.Set<CopilotConversationEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddMessageAsync(CopilotMessage message, CancellationToken cancellationToken = default)
    {
        var entity = new CopilotMessageEntity
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            Role = (int)message.Role,
            Content = message.Content,
            ContextType = (int)message.ContextType,
            ContextId = message.ContextId,
            SuggestedActionsJson = message.SuggestedActionsJson,
            CreatedAt = message.CreatedAt
        };

        await _dbContext.Set<CopilotMessageEntity>().AddAsync(entity, cancellationToken);

        var conversation = await _dbContext.Set<CopilotConversationEntity>()
            .FirstOrDefaultAsync(x => x.Id == message.ConversationId, cancellationToken);

        if (conversation != null)
        {
            conversation.LastMessageAt = message.CreatedAt;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(CopilotConversation conversation, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<CopilotConversationEntity>()
            .FirstOrDefaultAsync(x => x.Id == conversation.Id, cancellationToken);

        if (existing == null)
            return;

        existing.LastMessageAt = conversation.LastMessageAt;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<CopilotConversationEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<CopilotConversationEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static CopilotConversation MapToDomain(CopilotConversationEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        UserId = e.UserId,
        CreatedAt = e.CreatedAt,
        LastMessageAt = e.LastMessageAt
    };

    private static CopilotConversation MapToDomainWithMessages(CopilotConversationEntity e)
    {
        var conversation = MapToDomain(e);
        conversation.Messages = e.Messages.OrderBy(m => m.CreatedAt).Select(m => new CopilotMessage
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            Role = (MessageRole)m.Role,
            Content = m.Content,
            ContextType = (ContextType)m.ContextType,
            ContextId = m.ContextId,
            SuggestedActionsJson = m.SuggestedActionsJson,
            CreatedAt = m.CreatedAt
        }).ToList();

        return conversation;
    }

    private static CopilotConversationEntity MapToEntity(CopilotConversation d)
    {
        var entity = new CopilotConversationEntity
        {
            Id = d.Id,
            TenantId = d.TenantId,
            UserId = d.UserId,
            CreatedAt = d.CreatedAt,
            LastMessageAt = d.LastMessageAt
        };

        foreach (var message in d.Messages)
        {
            entity.Messages.Add(new CopilotMessageEntity
            {
                Id = message.Id,
                ConversationId = d.Id,
                Role = (int)message.Role,
                Content = message.Content,
                ContextType = (int)message.ContextType,
                ContextId = message.ContextId,
                SuggestedActionsJson = message.SuggestedActionsJson,
                CreatedAt = message.CreatedAt
            });
        }

        return entity;
    }
}
