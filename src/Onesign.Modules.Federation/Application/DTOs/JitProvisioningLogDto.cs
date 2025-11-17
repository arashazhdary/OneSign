using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Application.DTOs;

public class JitProvisioningLogDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? SamlProviderId { get; set; }
    public Guid? OidcFederationProviderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string ExternalUserId { get; set; } = string.Empty;
    public JitProvisioningStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}
