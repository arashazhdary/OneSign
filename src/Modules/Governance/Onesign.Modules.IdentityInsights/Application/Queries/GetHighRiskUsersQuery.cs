using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetHighRiskUsersQuery : IRequest<Result<List<HighRiskUserDto>>>
{
    public Guid TenantId { get; set; }
    public int Threshold { get; set; } = 70;
    public int Limit { get; set; } = 100;
}

public class GetHighRiskUsersQueryHandler : IRequestHandler<GetHighRiskUsersQuery, Result<List<HighRiskUserDto>>>
{
    private readonly IRiskScoringService _riskScoringService;

    public GetHighRiskUsersQueryHandler(IRiskScoringService riskScoringService)
    {
        _riskScoringService = riskScoringService;
    }

    public async Task<Result<List<HighRiskUserDto>>> Handle(GetHighRiskUsersQuery request, CancellationToken cancellationToken)
    {
        var profiles = await _riskScoringService.GetHighRiskUsersAsync(
            request.TenantId, request.Threshold, request.Limit, cancellationToken);

        var dtos = profiles.Select(p =>
        {
            var riskFactors = new List<string>();
            try
            {
                riskFactors = JsonSerializer.Deserialize<List<string>>(p.RiskFactorsJson) ?? new List<string>();
            }
            catch
            {
                // Ignore deserialization errors
            }

            return new HighRiskUserDto
            {
                UserId = p.UserId,
                UserDisplayName = p.UserDisplayName,
                RiskScore = p.RiskScore,
                RiskFactors = riskFactors,
                LastLoginAt = p.LastLoginAt,
                MfaEnabled = p.MfaEnabled,
                PrivilegedRolesCount = p.PrivilegedRolesCount,
                ApplicationsCount = p.ApplicationsCount,
                CalculatedAt = p.CalculatedAt
            };
        }).ToList();

        return Result.Success(dtos);
    }
}
