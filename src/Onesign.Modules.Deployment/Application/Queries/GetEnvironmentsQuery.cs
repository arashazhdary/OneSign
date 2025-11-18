using MediatR;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentsQuery : IRequest<Result<List<EnvironmentSummaryDto>>>
{
    public EnvironmentType? FilterByType { get; set; }
    public string? FilterByRegionId { get; set; }
}

public class EnvironmentSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EnvironmentType Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public EnvironmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHeartbeatAt { get; set; }
}
