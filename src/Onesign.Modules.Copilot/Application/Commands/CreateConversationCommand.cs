using MediatR;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Commands;

public class CreateConversationCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? Title { get; set; }
    public ContextType ContextType { get; set; }
    public Guid? ContextId { get; set; }
}
