using Onesign.Modules.Platform.Application.DTOs;

namespace Onesign.Modules.Platform.Application.Services;

public interface IDiagnosticsService
{
    Task<DiagnosticsDto> GetDiagnosticsAsync(CancellationToken cancellationToken = default);
    Task<SystemInfoDto> GetSystemInfoAsync(CancellationToken cancellationToken = default);
    Task<MemoryInfoDto> GetMemoryInfoAsync(CancellationToken cancellationToken = default);
    Task<List<ModuleDiagnosticsDto>> GetModuleDiagnosticsAsync(CancellationToken cancellationToken = default);
    Task<List<ConnectionDiagnosticsDto>> GetConnectionDiagnosticsAsync(CancellationToken cancellationToken = default);
}
