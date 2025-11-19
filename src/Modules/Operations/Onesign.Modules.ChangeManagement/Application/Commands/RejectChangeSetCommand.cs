using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class RejectChangeSetCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
