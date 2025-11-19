using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class UpdateChangeSetCommand : IRequest<Result<ChangeSetDetailDto>>
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}
