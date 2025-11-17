using MediatR;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class AssignPolicyCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyDefinitionId { get; set; }
    public PolicyTargetType TargetType { get; set; }
    public string TargetKey { get; set; } = string.Empty;
    public string? TargetName { get; set; }
    public int Order { get; set; }
}
