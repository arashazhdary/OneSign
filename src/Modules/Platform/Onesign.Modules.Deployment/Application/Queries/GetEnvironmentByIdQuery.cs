using MediatR;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentByIdQuery : IRequest<Result<EnvironmentDetailDto>>
{
    public string EnvironmentId { get; set; } = string.Empty;
}

public class EnvironmentDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EnvironmentType Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public string DbSchemaVersion { get; set; } = string.Empty;
    public string LicenseKey { get; set; } = string.Empty;
    public EnvironmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHeartbeatAt { get; set; }
    public FeatureConfigDto? FeatureConfig { get; set; }
}

public class FeatureConfigDto
{
    public int MaxTenants { get; set; }
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
    public List<string> EnabledModules { get; set; } = new();
}
