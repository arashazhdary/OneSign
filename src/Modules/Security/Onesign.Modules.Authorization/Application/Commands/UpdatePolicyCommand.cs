using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class UpdatePolicyCommand : IRequest<Result<PolicyDefinitionDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PolicyEffect Effect { get; set; }
    public int Priority { get; set; }
    public bool Enabled { get; set; }
    public List<PolicyConditionGroupDto> ConditionGroups { get; set; } = new();
}
