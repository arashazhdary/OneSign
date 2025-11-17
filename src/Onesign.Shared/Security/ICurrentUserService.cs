namespace Onesign.Shared.Security;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsGlobalAdmin { get; }
    bool IsTenantAdmin { get; }
}

