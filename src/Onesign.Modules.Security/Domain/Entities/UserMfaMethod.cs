using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class UserMfaMethod
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public MfaMethodType MethodType { get; private set; }
    public bool IsPrimary { get; private set; }
    public bool IsVerified { get; private set; }
    public string SecretEncrypted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public UserMfaMethod(
        Guid id,
        Guid tenantUserId,
        MfaMethodType methodType,
        bool isPrimary,
        string secretEncrypted)
    {
        Id = id;
        TenantUserId = tenantUserId;
        MethodType = methodType;
        IsPrimary = isPrimary;
        IsVerified = false;
        SecretEncrypted = secretEncrypted;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsVerified()
    {
        IsVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsVerified = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
