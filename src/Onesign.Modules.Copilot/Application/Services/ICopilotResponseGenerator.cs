using Onesign.Modules.Copilot.Application.DTOs;

namespace Onesign.Modules.Copilot.Application.Services;

public interface ICopilotResponseGenerator
{
    Task<CopilotGeneratedResponse> GenerateResponseAsync(
        string userMessage,
        CopilotContextDto context,
        List<ConversationMessageDto> conversationHistory,
        string locale,
        CancellationToken cancellationToken = default);
}

public class CopilotGeneratedResponse
{
    public string AnswerText { get; set; } = string.Empty;
    public List<SuggestedActionDto> SuggestedActions { get; set; } = new();
}
