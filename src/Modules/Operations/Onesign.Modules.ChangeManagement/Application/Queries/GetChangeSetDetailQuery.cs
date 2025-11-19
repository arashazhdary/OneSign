using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Queries;

public class GetChangeSetDetailQuery : IRequest<Result<ChangeSetDetailDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
}
