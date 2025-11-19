using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetZombieAccountsQuery : IRequest<Result<List<ZombieAccountDto>>>
{
    public Guid TenantId { get; set; }
    public int InactiveDays { get; set; } = 90;
}

public class GetZombieAccountsQueryHandler : IRequestHandler<GetZombieAccountsQuery, Result<List<ZombieAccountDto>>>
{
    private readonly IRiskScoringService _riskScoringService;

    public GetZombieAccountsQueryHandler(IRiskScoringService riskScoringService)
    {
        _riskScoringService = riskScoringService;
    }

    public async Task<Result<List<ZombieAccountDto>>> Handle(GetZombieAccountsQuery request, CancellationToken cancellationToken)
    {
        var profiles = await _riskScoringService.GetZombieAccountsAsync(
            request.TenantId, request.InactiveDays, cancellationToken);

        var dtos = profiles.Select(p =>
        {
            var daysSinceLogin = p.LastLoginAt.HasValue
                ? (int)(DateTime.UtcNow - p.LastLoginAt.Value).TotalDays
                : -1;

            return new ZombieAccountDto
            {
                UserId = p.UserId,
                UserDisplayName = p.UserDisplayName,
                LastLoginAt = p.LastLoginAt,
                DaysSinceLogin = daysSinceLogin,
                ApplicationsCount = p.ApplicationsCount,
                PrivilegedRolesCount = p.PrivilegedRolesCount,
                MfaEnabled = p.MfaEnabled
            };
        }).ToList();

        return Result.Success(dtos);
    }
}
