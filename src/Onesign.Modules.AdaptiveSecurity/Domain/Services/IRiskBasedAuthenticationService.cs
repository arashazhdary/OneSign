using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Services;

public interface IRiskBasedAuthenticationService
{
    Task<AdaptiveDecision> EvaluateAuthenticationAsync(
        Guid tenantId,
        Guid userId,
        AuthenticationContext context,
        CancellationToken cancellationToken = default);

    Task<bool> RequiresMfaAsync(
        Guid tenantId,
        Guid userId,
        int riskScore,
        CancellationToken cancellationToken = default);

    Task<int> GetSessionLifetimeAsync(
        Guid tenantId,
        Guid userId,
        int riskScore,
        CancellationToken cancellationToken = default);
}

public class AuthenticationContext
{
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public string? GeoLocation { get; set; }
    public bool IsNewDevice { get; set; }
    public bool IsNewLocation { get; set; }
    public int FailedAttempts { get; set; }
    public DateTime? LastSuccessfulLogin { get; set; }
}
