using MediatR;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetRegionsHealthQuery : IRequest<Result<List<RegionHealthDto>>>
{
}
