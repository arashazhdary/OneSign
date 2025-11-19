using MediatR;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Commands;

public class CreateHuntDraftCommand : IRequest<Result<ActionExecutionResultDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Query { get; set; } = string.Empty;
    public bool CreateScheduledHunt { get; set; }
    public string? Schedule { get; set; }
}
