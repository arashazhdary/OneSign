using Onesign.Modules.Platform.Application.DTOs;

namespace Onesign.Modules.Platform.Application.Services;

public interface IPlatformHealthAggregator
{
    Task<PlatformHealthDto> GetHealthReportAsync(CancellationToken cancellationToken = default);
    Task<ComponentHealthDto> GetComponentHealthAsync(string componentName, CancellationToken cancellationToken = default);
}
