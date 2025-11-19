using MediatR;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class BootstrapEnvironmentCommand : IRequest<Result<string>>
{
    public string EnvironmentId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EnvironmentType Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string LicenseKey { get; set; } = string.Empty;
    public string DatabaseConnectionString { get; set; } = string.Empty;
    public string StorageEndpoint { get; set; } = string.Empty;
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string ObservabilityEndpoint { get; set; } = string.Empty;
    public string FeaturesJson { get; set; } = "{}";
    public int MaxTenants { get; set; }
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
    public string EnabledModulesJson { get; set; } = "[]";
}
