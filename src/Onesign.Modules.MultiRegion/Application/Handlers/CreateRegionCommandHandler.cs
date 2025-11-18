using MediatR;
using Onesign.Modules.MultiRegion.Application.Commands;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Handlers;

public class CreateRegionCommandHandler : IRequestHandler<CreateRegionCommand, Result<string>>
{
    private readonly IRegionRepository _repository;

    public CreateRegionCommandHandler(IRegionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(CreateRegionCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Id))
            return Result.Failure<string>("InvalidId", "Region ID is required");

        var existingRegion = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existingRegion != null)
            return Result.Failure<string>("RegionExists", "Region with this ID already exists");

        var region = new Region
        {
            Id = request.Id,
            DisplayName = request.DisplayName,
            IsActive = true,
            EndpointBaseUrl = request.EndpointBaseUrl,
            DbClusterRef = request.DbClusterRef,
            StorageClusterRef = request.StorageClusterRef,
            Status = RegionStatus.Healthy,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(region, cancellationToken);

        return Result.Success(region.Id);
    }
}
