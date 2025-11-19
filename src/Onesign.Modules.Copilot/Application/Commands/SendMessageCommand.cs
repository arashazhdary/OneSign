using MediatR;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Commands;

public class SendMessageCommand : IRequest<Result<CopilotQueryResponse>>
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";
}
