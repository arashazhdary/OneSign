using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

public class JitProvisioningLogEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? SamlProviderId { get; set; }
    public Guid? OidcFederationProviderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string ExternalUserId { get; set; } = string.Empty;
    public JitProvisioningStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ProvisionedDataJson { get; set; }
    public DateTime CreatedAt { get; set; }

    public JitProvisioningLog ToDomain()
    {
        return new JitProvisioningLog
        {
            Id = Id,
            TenantId = TenantId,
            SamlProviderId = SamlProviderId,
            OidcFederationProviderId = OidcFederationProviderId,
            UserId = UserId,
            ExternalUserId = ExternalUserId,
            Status = Status,
            ErrorMessage = ErrorMessage,
            ProvisionedDataJson = ProvisionedDataJson,
            CreatedAt = CreatedAt
        };
    }

    public static JitProvisioningLogEntity FromDomain(JitProvisioningLog log)
    {
        return new JitProvisioningLogEntity
        {
            Id = log.Id,
            TenantId = log.TenantId,
            SamlProviderId = log.SamlProviderId,
            OidcFederationProviderId = log.OidcFederationProviderId,
            UserId = log.UserId,
            ExternalUserId = log.ExternalUserId,
            Status = log.Status,
            ErrorMessage = log.ErrorMessage,
            ProvisionedDataJson = log.ProvisionedDataJson,
            CreatedAt = log.CreatedAt
        };
    }
}
