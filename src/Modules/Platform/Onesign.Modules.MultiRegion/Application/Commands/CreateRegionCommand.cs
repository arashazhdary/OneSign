using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Commands;

public class CreateRegionCommand : IRequest<Result<string>>
{
    public string Id { get; set; } = string.Empty; // e.g., "eu-west-1"
    public string DisplayName { get; set; } = string.Empty;
    public string EndpointBaseUrl { get; set; } = string.Empty;
    public string DbClusterRef { get; set; } = string.Empty;
    public string StorageClusterRef { get; set; } = string.Empty;
}
