using MediatR;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetTenantDataResidencyQuery : IRequest<Result<TenantDataResidency>>
{
    public Guid TenantId { get; set; }
}

public class GetTenantDataResidencyQueryHandler : IRequestHandler<GetTenantDataResidencyQuery, Result<TenantDataResidency>>
{
    private readonly ITenantDataResidencyService _dataResidencyService;

    public GetTenantDataResidencyQueryHandler(ITenantDataResidencyService dataResidencyService)
    {
        _dataResidencyService = dataResidencyService;
    }

    public async Task<Result<TenantDataResidency>> Handle(GetTenantDataResidencyQuery request, CancellationToken cancellationToken)
    {
        var residency = await _dataResidencyService.GetTenantDataResidencyAsync(request.TenantId, cancellationToken);

        if (residency == null)
        {
            return Result.Failure<TenantDataResidency>("NotFound", $"Data residency not found for tenant {request.TenantId}");
        }

        return Result.Success(residency);
    }
}
