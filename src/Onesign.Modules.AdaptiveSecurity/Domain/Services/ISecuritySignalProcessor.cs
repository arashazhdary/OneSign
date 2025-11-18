using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Services;

public interface ISecuritySignalProcessor
{
    Task ProcessSignalAsync(SecuritySignal signal, CancellationToken cancellationToken = default);
}
