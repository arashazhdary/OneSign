using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Repositories;

namespace Onesign.Modules.Platform.Application.Services;

public class PlatformVersionService : IPlatformVersionService
{
    private readonly IPlatformVersionRepository _repository;

    public PlatformVersionService(IPlatformVersionRepository repository)
    {
        _repository = repository;
    }

    public async Task<PlatformVersionDto?> GetCurrentVersionAsync(CancellationToken cancellationToken = default)
    {
        var version = await _repository.GetCurrentVersionAsync(cancellationToken);
        return version != null ? MapToDto(version) : null;
    }

    public async Task<List<PlatformVersionDto>> GetVersionHistoryAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var versions = await _repository.GetVersionHistoryAsync(page, pageSize, cancellationToken);
        return versions.Select(MapToDto).ToList();
    }

    public async Task<int> GetTotalVersionCountAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetTotalCountAsync(cancellationToken);
    }

    public async Task<PlatformVersionDto> CreateVersionAsync(string version, string? description, string? releaseNotes, CancellationToken cancellationToken = default)
    {
        var platformVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = version,
            ReleaseDate = DateTimeOffset.UtcNow,
            Description = description,
            ReleaseNotes = releaseNotes,
            IsCurrentVersion = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(platformVersion, cancellationToken);
        return MapToDto(platformVersion);
    }

    public async Task SetCurrentVersionAsync(Guid versionId, CancellationToken cancellationToken = default)
    {
        await _repository.SetCurrentVersionAsync(versionId, cancellationToken);
    }

    private static PlatformVersionDto MapToDto(PlatformVersion v) => new()
    {
        Id = v.Id,
        Version = v.Version,
        ReleaseDate = v.ReleaseDate,
        Description = v.Description,
        ReleaseNotes = v.ReleaseNotes,
        IsCurrentVersion = v.IsCurrentVersion,
        CreatedAt = v.CreatedAt
    };
}
