using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class SimulateChangeSetCommand : IRequest<Result<SimulationResultDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
}
