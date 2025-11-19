using MediatR;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Commands;

public class CreateApprovalRuleCommand : IRequest<Result<Guid>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ChangeCategory Category { get; set; }
    public int MinApprovals { get; set; } = 1;
    public List<Guid> ApproverUserIds { get; set; } = new();
    public List<Guid> ApproverGroupIds { get; set; } = new();
    public bool IsActive { get; set; } = true;
}
