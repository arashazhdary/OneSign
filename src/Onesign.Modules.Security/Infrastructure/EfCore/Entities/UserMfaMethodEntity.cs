using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class UserMfaMethodEntity
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public MfaMethodType MethodType { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsVerified { get; set; }
    public string SecretEncrypted { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static UserMfaMethodEntity FromDomain(UserMfaMethod domain)
    {
        return new UserMfaMethodEntity
        {
            Id = domain.Id,
            TenantUserId = domain.TenantUserId,
            MethodType = domain.MethodType,
            IsPrimary = domain.IsPrimary,
            IsVerified = domain.IsVerified,
            SecretEncrypted = domain.SecretEncrypted,
            CreatedAt = domain.CreatedAt,
            UpdatedAt = domain.UpdatedAt
        };
    }

    public UserMfaMethod ToDomain()
    {
        var method = new UserMfaMethod(
            Id,
            TenantUserId,
            MethodType,
            IsPrimary,
            SecretEncrypted
        );

        typeof(UserMfaMethod).GetProperty(nameof(IsVerified))!
            .SetValue(method, IsVerified);
        typeof(UserMfaMethod).GetProperty(nameof(CreatedAt))!
            .SetValue(method, CreatedAt);
        typeof(UserMfaMethod).GetProperty(nameof(UpdatedAt))!
            .SetValue(method, UpdatedAt);

        return method;
    }
}
