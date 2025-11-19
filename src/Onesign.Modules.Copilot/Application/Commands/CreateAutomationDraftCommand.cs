using MediatR;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Commands;

public class CreateAutomationDraftCommand : IRequest<Result<ActionExecutionResultDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string TriggerEventType { get; set; } = string.Empty;
    public string? ConditionExpression { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string? ActionConfigJson { get; set; }
}
