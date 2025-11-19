using Onesign.Modules.Platform.Application.DTOs;

namespace Onesign.Modules.Platform.Application.Services;

public interface IPlatformVersionService
{
    Task<PlatformVersionDto?> GetCurrentVersionAsync(CancellationToken cancellationToken = default);
    Task<List<PlatformVersionDto>> GetVersionHistoryAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> GetTotalVersionCountAsync(CancellationToken cancellationToken = default);
    Task<PlatformVersionDto> CreateVersionAsync(string version, string? description, string? releaseNotes, CancellationToken cancellationToken = default);
    Task SetCurrentVersionAsync(Guid versionId, CancellationToken cancellationToken = default);
}
