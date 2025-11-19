using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetTenantRiskQuery : IRequest<Result<TenantRiskProfileDto>>
{
    public Guid TenantId { get; set; }
}

public class GetTenantRiskQueryHandler : IRequestHandler<GetTenantRiskQuery, Result<TenantRiskProfileDto>>
{
    private readonly ITenantRiskProfileRepository _repository;

    public GetTenantRiskQueryHandler(ITenantRiskProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<TenantRiskProfileDto>> Handle(GetTenantRiskQuery request, CancellationToken cancellationToken)
    {
        var profile = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (profile == null)
        {
            return Result.Success(new TenantRiskProfileDto
            {
                TenantId = request.TenantId,
                RiskScore = 0,
                UsersCount = 0,
                HighRiskUsersCount = 0,
                MfaEnrollmentRate = 0,
                PrivilegedUsersCount = 0,
                FailedLoginRate = 0,
                OpenGovernanceFindingsCount = 0,
                CalculatedAt = DateTime.UtcNow
            });
        }

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
