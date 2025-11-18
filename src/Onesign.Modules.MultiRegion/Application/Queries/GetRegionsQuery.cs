using MediatR;
using Onesign.Modules.MultiRegion.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetRegionsQuery : IRequest<Result<List<RegionDto>>>
{
    public bool ActiveOnly { get; set; } = false;
}
