namespace Onesign.Modules.Copilot.Infrastructure.EfCore.Entities;

public class CopilotMessageEntity
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public int Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public int ContextType { get; set; }
    public Guid? ContextId { get; set; }
    public string? SuggestedActionsJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public CopilotConversationEntity Conversation { get; set; } = null!;
}
