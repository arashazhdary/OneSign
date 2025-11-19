using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Commands;

public class UpdateScheduledHuntCommand : IRequest<Result<ScheduledHuntDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public Guid SavedQueryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScheduleSpec { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public int MinMatchCountForFinding { get; set; }
    public int MaxRowsToScan { get; set; }
    public int TimeWindowMinutes { get; set; }
    public HuntActionConfigDto? Actions { get; set; }
}
