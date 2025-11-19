using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class MfaChallengeEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public MfaMethodType MethodType { get; set; }
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Consumed { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static MfaChallengeEntity FromDomain(MfaChallenge domain)
    {
        return new MfaChallengeEntity
        {
            Id = domain.Id,
            TenantUserId = domain.TenantUserId,
            MethodType = domain.MethodType,
            CodeHash = domain.CodeHash,
            ExpiresAt = domain.ExpiresAt,
            Consumed = domain.Consumed,
            DeviceId = domain.DeviceId,
            IpAddress = domain.IpAddress,
            CreatedAt = domain.CreatedAt
        };
    }

    public MfaChallenge ToDomain()
    {
        var challenge = new MfaChallenge(
            Id,
            TenantUserId,
            MethodType,
            CodeHash,
            ExpiresAt,
            DeviceId,
            IpAddress
        );

        typeof(MfaChallenge).GetProperty(nameof(Consumed))!
            .SetValue(challenge, Consumed);
        typeof(MfaChallenge).GetProperty(nameof(CreatedAt))!
            .SetValue(challenge, CreatedAt);

        return challenge;
    }
}
