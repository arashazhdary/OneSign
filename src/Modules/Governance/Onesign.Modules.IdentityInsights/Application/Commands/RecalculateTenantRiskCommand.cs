using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Commands;

public class RecalculateTenantRiskCommand : IRequest<Result<TenantRiskProfileDto>>
{
    public Guid TenantId { get; set; }
}

public class RecalculateTenantRiskCommandHandler : IRequestHandler<RecalculateTenantRiskCommand, Result<TenantRiskProfileDto>>
{
    private readonly IRiskScoringService _riskScoringService;

    public RecalculateTenantRiskCommandHandler(IRiskScoringService riskScoringService)
    {
        _riskScoringService = riskScoringService;
    }

    public async Task<Result<TenantRiskProfileDto>> Handle(RecalculateTenantRiskCommand request, CancellationToken cancellationToken)
    {
        await _riskScoringService.RecalculateAllUsersAsync(request.TenantId, cancellationToken);
        var profile = await _riskScoringService.CalculateTenantRiskAsync(request.TenantId, cancellationToken);

        var dto = new TenantRiskProfileDto
        {
            Id = profile.Id,
            TenantId = profile.TenantId,
            RiskScore = profile.RiskScore,
            UsersCount = profile.UsersCount,
            HighRiskUsersCount = profile.HighRiskUsersCount,
            MfaEnrollmentRate = profile.MfaEnrollmentRate,
            PrivilegedUsersCount = profile.PrivilegedUsersCount,
            FailedLoginRate = profile.FailedLoginRate,
            OpenGovernanceFindingsCount = profile.OpenGovernanceFindingsCount,
            CalculatedAt = profile.CalculatedAt
        };

        return Result.Success(dto);
    }
}
