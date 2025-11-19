using MediatR;
using Onesign.Modules.MultiRegion.Application.DTOs;
using Onesign.Modules.MultiRegion.Application.Queries;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Handlers;

public class GetRegionsQueryHandler : IRequestHandler<GetRegionsQuery, Result<List<RegionDto>>>
{
    private readonly IRegionRepository _repository;

    public GetRegionsQueryHandler(IRegionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<RegionDto>>> Handle(GetRegionsQuery request, CancellationToken cancellationToken)
    {
        var regions = request.ActiveOnly
            ? await _repository.GetActiveAsync(cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        var dtos = regions.Select(r => new RegionDto
        {
            Id = r.Id,
            DisplayName = r.DisplayName,
            IsActive = r.IsActive,
            EndpointBaseUrl = r.EndpointBaseUrl,
            DbClusterRef = r.DbClusterRef,
            StorageClusterRef = r.StorageClusterRef,
            Status = r.Status.ToString(),
            CreatedAt = r.CreatedAt,
            LastHealthCheckAt = r.LastHealthCheckAt
        }).ToList();

        return Result.Success(dtos);
    }
}
