using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class MfaChallenge
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public MfaMethodType MethodType { get; private set; }
    public string CodeHash { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool Consumed { get; private set; }
    public string DeviceId { get; private set; }
    public string IpAddress { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public MfaChallenge(
        Guid id,
        Guid tenantUserId,
        MfaMethodType methodType,
        string codeHash,
        DateTime expiresAt,
        string deviceId,
        string ipAddress)
    {
        Id = id;
        TenantUserId = tenantUserId;
        MethodType = methodType;
        CodeHash = codeHash;
        ExpiresAt = expiresAt;
        Consumed = false;
        DeviceId = deviceId;
        IpAddress = ipAddress;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsConsumed()
    {
        Consumed = true;
    }

    public bool IsExpired()
    {
        return DateTime.UtcNow > ExpiresAt;
    }

    public Guid UserId => TenantUserId;
    public Guid TenantId { get; set; }

    public void SetCodeHash(string codeHash)
    {
        CodeHash = codeHash;
    }
}
