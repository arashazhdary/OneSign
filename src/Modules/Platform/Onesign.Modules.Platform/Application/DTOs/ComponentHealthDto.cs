namespace Onesign.Modules.Platform.Application.DTOs;

public class ComponentHealthDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public double ResponseTimeMs { get; set; }
    public Dictionary<string, object>? Data { get; set; }
    public List<ComponentHealthDto>? SubComponents { get; set; }
}
