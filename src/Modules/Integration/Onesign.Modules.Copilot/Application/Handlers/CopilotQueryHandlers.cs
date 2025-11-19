using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Application.Queries;
using Onesign.Modules.Copilot.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Handlers;

public class GetConversationHistoryQueryHandler : IRequestHandler<GetConversationHistoryQuery, Result<ConversationHistoryDto>>
{
    private readonly ICopilotConversationRepository _repository;
    private readonly ILogger<GetConversationHistoryQueryHandler> _logger;

    public GetConversationHistoryQueryHandler(
        ICopilotConversationRepository repository,
        ILogger<GetConversationHistoryQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<ConversationHistoryDto>> Handle(GetConversationHistoryQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Getting conversation history for tenant {TenantId}, user {UserId}, conversation {ConversationId}",
            request.TenantId, request.UserId, request.ConversationId);

        var conversation = await _repository.GetByIdWithMessagesAsync(request.ConversationId, cancellationToken);

        if (conversation == null)
        {
            return Result.Failure<ConversationHistoryDto>("NotFound", "Conversation not found");
        }

        if (conversation.TenantId != request.TenantId || conversation.UserId != request.UserId)
        {
            return Result.Failure<ConversationHistoryDto>("NotFound", "Conversation not found");
        }

        var dto = new ConversationHistoryDto
        {
            ConversationId = conversation.Id,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            Messages = conversation.Messages.Select(m => new ConversationMessageDto
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
            }).ToList()
        };

        return Result.Success(dto);
    }
}

public class GetRecentConversationsQueryHandler : IRequestHandler<GetRecentConversationsQuery, Result<List<ConversationHistoryDto>>>
{
    private readonly ICopilotConversationRepository _repository;
    private readonly ILogger<GetRecentConversationsQueryHandler> _logger;

    public GetRecentConversationsQueryHandler(
        ICopilotConversationRepository repository,
        ILogger<GetRecentConversationsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<List<ConversationHistoryDto>>> Handle(GetRecentConversationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Getting recent conversations for tenant {TenantId}, user {UserId}",
            request.TenantId, request.UserId);

        var conversations = await _repository.GetByUserIdAsync(request.TenantId, request.UserId, request.Limit, cancellationToken);

        var dtos = conversations.Select(c => new ConversationHistoryDto
        {
            ConversationId = c.Id,
            CreatedAt = c.CreatedAt,
            LastMessageAt = c.LastMessageAt,
            Messages = new List<ConversationMessageDto>()
        }).ToList();

        return Result.Success(dtos);
    }
}
