namespace Onesign.Modules.Platform.Application.DTOs;

public class PlatformVersionDto
{
    public Guid Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public DateTimeOffset ReleaseDate { get; set; }
    public string? Description { get; set; }
    public string? ReleaseNotes { get; set; }
    public bool IsCurrentVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
