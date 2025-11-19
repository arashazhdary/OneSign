using MediatR;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Commands;

public class SendCopilotQueryCommand : IRequest<Result<CopilotQueryResponse>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ConversationId { get; set; }
    public ContextType ContextType { get; set; }
    public Guid? ContextId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";
}
