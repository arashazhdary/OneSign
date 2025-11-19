using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Commands;

public class RecalculateUserRiskCommand : IRequest<Result<HighRiskUserDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}

public class RecalculateUserRiskCommandHandler : IRequestHandler<RecalculateUserRiskCommand, Result<HighRiskUserDto>>
{
    private readonly IRiskScoringService _riskScoringService;

    public RecalculateUserRiskCommandHandler(IRiskScoringService riskScoringService)
    {
        _riskScoringService = riskScoringService;
    }

    public async Task<Result<HighRiskUserDto>> Handle(RecalculateUserRiskCommand request, CancellationToken cancellationToken)
    {
        var profile = await _riskScoringService.CalculateUserRiskAsync(
            request.TenantId, request.UserId, cancellationToken);

        var riskFactors = new List<string>();
        try
        {
            riskFactors = JsonSerializer.Deserialize<List<string>>(profile.RiskFactorsJson) ?? new List<string>();
        }
        catch
        {
            // Ignore deserialization errors
        }

        var dto = new HighRiskUserDto
        {
            UserId = profile.UserId,
            UserDisplayName = profile.UserDisplayName,
            RiskScore = profile.RiskScore,
            RiskFactors = riskFactors,
            LastLoginAt = profile.LastLoginAt,
            MfaEnabled = profile.MfaEnabled,
            PrivilegedRolesCount = profile.PrivilegedRolesCount,
            ApplicationsCount = profile.ApplicationsCount,
            CalculatedAt = profile.CalculatedAt
        };

        return Result.Success(dto);
    }
}
