namespace Onesign.Modules.Copilot.Domain.Entities;

public class CopilotConversation
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }

    public List<CopilotMessage> Messages { get; set; } = new();
}
