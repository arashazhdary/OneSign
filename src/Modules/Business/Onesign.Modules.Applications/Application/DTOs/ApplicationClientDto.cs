using Onesign.Modules.Applications.Domain.Enums;

namespace Onesign.Modules.Applications.Application.DTOs;

public class ApplicationClientDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ApplicationType ApplicationType { get; set; }
    public GrantType GrantType { get; set; }
    public List<RedirectUriDto> RedirectUris { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

