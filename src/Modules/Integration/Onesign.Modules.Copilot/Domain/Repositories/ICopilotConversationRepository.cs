using Onesign.Modules.Copilot.Domain.Entities;

namespace Onesign.Modules.Copilot.Domain.Repositories;

public interface ICopilotConversationRepository
{
    Task<CopilotConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CopilotConversation?> GetByIdWithMessagesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CopilotConversation>> GetByUserIdAsync(Guid tenantId, Guid userId, int limit, CancellationToken cancellationToken = default);
    Task<CopilotConversation?> GetLatestByUserIdAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(CopilotConversation conversation, CancellationToken cancellationToken = default);
    Task AddMessageAsync(CopilotMessage message, CancellationToken cancellationToken = default);
    Task UpdateAsync(CopilotConversation conversation, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
