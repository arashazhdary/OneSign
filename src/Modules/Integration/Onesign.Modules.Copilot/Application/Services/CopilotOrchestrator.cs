using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Entities;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Copilot.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Services;

public class CopilotOrchestrator : ICopilotOrchestrator
{
    private readonly ICopilotContextBuilder _contextBuilder;
    private readonly ICopilotResponseGenerator _responseGenerator;
    private readonly ICopilotConversationRepository _conversationRepository;
    private readonly ILogger<CopilotOrchestrator> _logger;

    public CopilotOrchestrator(
        ICopilotContextBuilder contextBuilder,
        ICopilotResponseGenerator responseGenerator,
        ICopilotConversationRepository conversationRepository,
        ILogger<CopilotOrchestrator> logger)
    {
        _contextBuilder = contextBuilder;
        _responseGenerator = responseGenerator;
        _conversationRepository = conversationRepository;
        _logger = logger;
    }

    public async Task<Result<CopilotQueryResponse>> ProcessQueryAsync(CopilotQueryRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing copilot query for tenant {TenantId}, user {UserId}, context {ContextType}",
            request.TenantId, request.UserId, request.ContextType);

        // Get or create conversation
        CopilotConversation conversation;
        List<ConversationMessageDto> conversationHistory;

        if (request.ConversationId.HasValue)
        {
            var existingConversation = await _conversationRepository.GetByIdWithMessagesAsync(request.ConversationId.Value, cancellationToken);
            if (existingConversation == null || existingConversation.TenantId != request.TenantId || existingConversation.UserId != request.UserId)
            {
                return Result.Failure<CopilotQueryResponse>("NotFound", "Conversation not found");
            }
            conversation = existingConversation;
            conversationHistory = MapToConversationHistory(conversation.Messages);
        }
        else
        {
            conversation = new CopilotConversation
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                UserId = request.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                LastMessageAt = DateTimeOffset.UtcNow
            };
            await _conversationRepository.AddAsync(conversation, cancellationToken);
            conversationHistory = new List<ConversationMessageDto>();
        }

        // Build context
        var context = await _contextBuilder.BuildContextAsync(request.TenantId, request.ContextType, request.ContextId, cancellationToken);

        // Save user message
        var userMessage = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = request.Message,
            ContextType = request.ContextType,
            ContextId = request.ContextId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _conversationRepository.AddMessageAsync(userMessage, cancellationToken);

        // Generate response
        var generatedResponse = await _responseGenerator.GenerateResponseAsync(
            request.Message,
            context,
            conversationHistory,
            request.Locale,
            cancellationToken);

        // Save assistant message
        var assistantMessage = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.Assistant,
            Content = generatedResponse.AnswerText,
            ContextType = request.ContextType,
            ContextId = request.ContextId,
            SuggestedActionsJson = JsonSerializer.Serialize(generatedResponse.SuggestedActions),
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _conversationRepository.AddMessageAsync(assistantMessage, cancellationToken);

        _logger.LogInformation("Copilot query processed successfully, conversation {ConversationId}, message {MessageId}",
            conversation.Id, assistantMessage.Id);

        return Result.Success(new CopilotQueryResponse
        {
            ConversationId = conversation.Id,
            MessageId = assistantMessage.Id,
            AnswerText = generatedResponse.AnswerText,
            SuggestedActions = generatedResponse.SuggestedActions
        });
    }

    private static List<ConversationMessageDto> MapToConversationHistory(List<CopilotMessage> messages)
    {
        return messages.Select(m => new ConversationMessageDto
        {
            MessageId = m.Id,
            Role = m.Role.ToString(),
            Content = m.Content,
            ContextType = m.ContextType.ToString(),
            ContextId = m.ContextId,
            SuggestedActions = string.IsNullOrEmpty(m.SuggestedActionsJson)
                ? new List<SuggestedActionDto>()
                : JsonSerializer.Deserialize<List<SuggestedActionDto>>(m.SuggestedActionsJson) ?? new List<SuggestedActionDto>(),
            CreatedAt = m.CreatedAt
        }).ToList();
    }
}
