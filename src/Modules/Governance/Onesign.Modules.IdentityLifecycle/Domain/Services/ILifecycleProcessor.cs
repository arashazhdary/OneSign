using Onesign.Modules.IdentityLifecycle.Domain.Entities;

namespace Onesign.Modules.IdentityLifecycle.Domain.Services;

public interface ILifecycleProcessor
{
    Task ProcessJoinerAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default);
    Task ProcessMoverAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default);
    Task ProcessLeaverAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default);
}
