using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Commands;

public class CreatePlatformVersionCommand : IRequest<Result<PlatformVersionDto>>
{
    public string Version { get; set; } = string.Empty;
    public string? ReleaseNotes { get; set; }
    public DateTime ReleaseDate { get; set; }
    public bool IsCurrentVersion { get; set; }
    public Guid CreatedByUserId { get; set; }
}
