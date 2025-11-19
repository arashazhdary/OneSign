using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.DTOs;

public class SuggestedActionDto
{
    public SuggestedActionType Type { get; set; }
    public string Label { get; set; } = string.Empty;
    public Dictionary<string, string> Parameters { get; set; } = new();
}
