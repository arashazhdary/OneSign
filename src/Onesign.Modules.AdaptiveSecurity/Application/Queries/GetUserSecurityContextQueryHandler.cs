using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetUserSecurityContextQueryHandler : IRequestHandler<GetUserSecurityContextQuery, Result<UserSecurityContextDto>>
{
    private readonly IUserSecurityContextRepository _repository;

    public GetUserSecurityContextQueryHandler(IUserSecurityContextRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<UserSecurityContextDto>> Handle(GetUserSecurityContextQuery request, CancellationToken cancellationToken)
    {
        var context = await _repository.GetByUserIdAsync(request.TenantId, request.UserId, cancellationToken);

        if (context == null)
        {
            return Result.Failure<UserSecurityContextDto>("NOT_FOUND", "User security context not found");
        }

        var dto = new UserSecurityContextDto
        {
            Id = context.Id,
            TenantId = context.TenantId,
            UserId = context.UserId,
            CurrentRiskScore = context.CurrentRiskScore,
            RiskFactorsJson = context.RiskFactorsJson,
            LastLoginLocation = context.LastLoginLocation,
            LastLoginDevice = context.LastLoginDevice,
            TrustedDevicesJson = context.TrustedDevicesJson,
            TrustedLocationsJson = context.TrustedLocationsJson,
            UpdatedAt = context.UpdatedAt
        };

        return Result.Success(dto);
    }
}
