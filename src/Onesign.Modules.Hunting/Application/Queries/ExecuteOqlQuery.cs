using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Queries;

public class ExecuteOqlQuery : IRequest<Result<HuntResultDto>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public OqlQueryDto Query { get; set; } = new();
}
