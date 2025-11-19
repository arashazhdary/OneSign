using MediatR;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class EvaluatePolicyQuery : IRequest<Result<PolicyEvaluationResult>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ClientId { get; set; }
    public string TargetKey { get; set; } = string.Empty;
    public PolicyTargetType TargetType { get; set; }
    public Dictionary<string, object>? Context { get; set; }
}
