using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Commands;

public class ExecuteHuntCommand : IRequest<Result<HuntRunDto>>
{
    public Guid ScheduledHuntId { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public bool IsManualRun { get; set; }
}
