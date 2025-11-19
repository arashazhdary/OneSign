namespace Onesign.Modules.Copilot.Application.DTOs;

public class CopilotQueryResponse
{
    public Guid ConversationId { get; set; }
    public Guid MessageId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public List<SuggestedActionDto> SuggestedActions { get; set; } = new();
}
