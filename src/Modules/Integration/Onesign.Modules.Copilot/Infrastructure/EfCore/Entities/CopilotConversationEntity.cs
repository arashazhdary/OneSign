namespace Onesign.Modules.Copilot.Infrastructure.EfCore.Entities;

public class CopilotConversationEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }

    public ICollection<CopilotMessageEntity> Messages { get; set; } = new List<CopilotMessageEntity>();
}
