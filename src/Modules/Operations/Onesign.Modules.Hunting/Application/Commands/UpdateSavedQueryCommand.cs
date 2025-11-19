using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Commands;

public class UpdateSavedQueryCommand : IRequest<Result<SavedQueryDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Dataset { get; set; } = string.Empty;
    public string QueryDslJson { get; set; } = string.Empty;
    public bool IsGlobalTemplate { get; set; }
    public bool IsEnabled { get; set; }
}
