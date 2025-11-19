using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class SubmitChangeSetCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
}
