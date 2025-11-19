using MediatR;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Commands;

public class SetTenantDataResidencyCommand : IRequest<Result<TenantDataResidency>>
{
    public Guid TenantId { get; set; }
    public string PrimaryRegionId { get; set; } = string.Empty;
    public List<string>? AllowedRegions { get; set; }
    public bool DataSovereignty { get; set; } = false;
    public bool StrictLocality { get; set; } = false;
    public string? ComplianceStandard { get; set; }
}

public class SetTenantDataResidencyCommandHandler : IRequestHandler<SetTenantDataResidencyCommand, Result<TenantDataResidency>>
{
    private readonly ITenantDataResidencyService _dataResidencyService;

    public SetTenantDataResidencyCommandHandler(ITenantDataResidencyService dataResidencyService)
    {
        _dataResidencyService = dataResidencyService;
    }

    public async Task<Result<TenantDataResidency>> Handle(SetTenantDataResidencyCommand request, CancellationToken cancellationToken)
    {
        var setRequest = new SetDataResidencyRequest
        {
            TenantId = request.TenantId,
            PrimaryRegionId = request.PrimaryRegionId,
            AllowedRegions = request.AllowedRegions,
            Requirements = new DataResidencyRequirements
            {
                DataSovereignty = request.DataSovereignty,
                StrictLocality = request.StrictLocality,
                ComplianceStandard = request.ComplianceStandard
            }
        };

        var result = await _dataResidencyService.SetTenantDataResidencyAsync(setRequest, cancellationToken);
        return Result.Success(result);
    }
}
