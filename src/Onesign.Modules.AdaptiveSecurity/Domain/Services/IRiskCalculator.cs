using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Services;

public interface IRiskCalculator
{
    Task<int> CalculateRiskAsync(Guid tenantId, Guid userId, IReadOnlyList<SecuritySignal> signals, CancellationToken cancellationToken = default);
}
