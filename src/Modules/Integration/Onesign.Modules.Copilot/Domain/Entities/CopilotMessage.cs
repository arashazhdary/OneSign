using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Domain.Entities;

public class CopilotMessage
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public MessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public ContextType ContextType { get; set; }
    public Guid? ContextId { get; set; }
    public string? SuggestedActionsJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
