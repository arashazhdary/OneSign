using Onesign.Modules.AccessRequests.Domain.Entities;

namespace Onesign.Modules.AccessRequests.Domain.Services;

public interface IAccessRequestProvisioningService
{
    Task<bool> ProvisionAccessAsync(AccessRequest request, CancellationToken cancellationToken = default);
    Task<bool> RevokeAccessAsync(AccessRequest request, CancellationToken cancellationToken = default);
    Task<bool> CheckProvisioningStatusAsync(Guid requestId, CancellationToken cancellationToken = default);
}
