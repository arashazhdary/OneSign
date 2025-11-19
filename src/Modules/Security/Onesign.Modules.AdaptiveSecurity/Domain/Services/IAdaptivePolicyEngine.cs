using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Services;

public interface IAdaptivePolicyEngine
{
    Task<AdaptiveDecision> EvaluateAsync(Guid tenantId, Guid userId, UserSecurityContext context, CancellationToken cancellationToken = default);
}
