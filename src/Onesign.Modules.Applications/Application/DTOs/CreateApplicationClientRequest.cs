using Onesign.Modules.Applications.Domain.Enums;

namespace Onesign.Modules.Applications.Application.DTOs;

public class CreateApplicationClientRequest
{
    public string Name { get; set; } = string.Empty;
    public ApplicationType ApplicationType { get; set; }
    public GrantType GrantType { get; set; }
    public List<string> RedirectUris { get; set; } = new();
}

