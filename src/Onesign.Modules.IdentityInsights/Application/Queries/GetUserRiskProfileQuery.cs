using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetUserRiskProfileQuery : IRequest<Result<UserRiskProfileDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}

public class UserRiskProfileDto
{
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public List<RiskFactorDto> RiskFactors { get; set; } = new();
    public bool MfaEnabled { get; set; }
    public int PrivilegedRolesCount { get; set; }
}

public class RiskFactorDto
{
    public string Factor { get; set; } = string.Empty;
    public int ImpactScore { get; set; }
}
