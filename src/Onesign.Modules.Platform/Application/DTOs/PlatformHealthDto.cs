namespace Onesign.Modules.Platform.Application.DTOs;

public class PlatformHealthDto
{
    public string Status { get; set; } = string.Empty;
    public List<ComponentHealthDto> Components { get; set; } = new();
    public DateTimeOffset CheckedAt { get; set; }
    public double TotalCheckDurationMs { get; set; }
    public List<string> Warnings { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
