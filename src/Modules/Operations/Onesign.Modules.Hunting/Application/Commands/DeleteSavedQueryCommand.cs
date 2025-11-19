using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Commands;

public class DeleteSavedQueryCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
}
