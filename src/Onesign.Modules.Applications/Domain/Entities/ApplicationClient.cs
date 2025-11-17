using Onesign.Modules.Applications.Domain.Enums;

namespace Onesign.Modules.Applications.Domain.Entities;

public class ApplicationClient
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ApplicationType ApplicationType { get; set; }
    public GrantType GrantType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

