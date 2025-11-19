using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class CreateChangeSetCommand : IRequest<Result<ChangeSetDetailDto>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}

public class CreateChangeItemDto
{
    public string TargetType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string Operation { get; set; } = string.Empty;
    public string? CurrentValueJson { get; set; }
    public string? ProposedValueJson { get; set; }
    public int Order { get; set; }
}
