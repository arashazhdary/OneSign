using MediatR;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Queries;

public class GetConversationHistoryQuery : IRequest<Result<ConversationHistoryDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid ConversationId { get; set; }
}

public class GetRecentConversationsQuery : IRequest<Result<List<ConversationHistoryDto>>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public int Limit { get; set; } = 10;
}
