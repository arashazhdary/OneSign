using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Commands;

public class CreateScheduledHuntCommand : IRequest<Result<ScheduledHuntDto>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public Guid SavedQueryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScheduleSpec { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public int MinMatchCountForFinding { get; set; } = 1;
    public int MaxRowsToScan { get; set; } = 10000;
    public int TimeWindowMinutes { get; set; } = 60;
    public HuntActionConfigDto? Actions { get; set; }
}
