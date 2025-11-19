using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Queries;

public class GetChangeExecutionLogQuery : IRequest<Result<List<ChangeExecutionLogDto>>>
{
    public Guid ChangeSetId { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string? Step { get; set; }
}
