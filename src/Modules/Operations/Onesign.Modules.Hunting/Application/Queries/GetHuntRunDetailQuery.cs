using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Queries;

public class GetHuntRunDetailQuery : IRequest<Result<HuntRunDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
}
