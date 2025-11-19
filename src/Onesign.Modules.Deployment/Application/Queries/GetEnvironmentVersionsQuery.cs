using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetEnvironmentVersionsQuery : IRequest<Result<EnvironmentVersionsResponse>>
{
}

public class EnvironmentVersionsResponse
{
    public string PlatformVersion { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = string.Empty;
    public string DatabaseVersion { get; set; } = string.Empty;
    public List<ModuleVersion> Modules { get; set; } = new();
    public List<ServiceVersion> Services { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

public class ModuleVersion
{
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}

public class ServiceVersion
{
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class GetEnvironmentVersionsQueryHandler : IRequestHandler<GetEnvironmentVersionsQuery, Result<EnvironmentVersionsResponse>>
{
    public async Task<Result<EnvironmentVersionsResponse>> Handle(GetEnvironmentVersionsQuery request, CancellationToken cancellationToken)
    {
        var response = new EnvironmentVersionsResponse
        {
            PlatformVersion = "1.0.0",
            ApiVersion = "v1",
            DatabaseVersion = "PostgreSQL 15.0",
            Modules = new List<ModuleVersion>
            {
                new() { Name = "Identity", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Authorization", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Audit", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Federation", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Tenants", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Applications", Version = "1.0.0", IsEnabled = true },
                new() { Name = "MultiRegion", Version = "1.0.0", IsEnabled = true },
                new() { Name = "Deployment", Version = "1.0.0", IsEnabled = true }
            },
            Services = new List<ServiceVersion>
            {
                new() { Name = "API", Version = "1.0.0", Status = "Running" },
                new() { Name = "Worker", Version = "1.0.0", Status = "Running" },
                new() { Name = "Admin Portal", Version = "1.0.0", Status = "Running" },
                new() { Name = "Login Portal", Version = "1.0.0", Status = "Running" }
            },
            LastUpdated = DateTime.UtcNow
        };

        return await Task.FromResult(Result.Success(response));
    }
}
