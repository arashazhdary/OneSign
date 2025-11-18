using Onesign.Modules.Crypto.Domain.Entities;

namespace Onesign.Modules.Crypto.Domain.Services;

public interface IKeyRolloverService
{
    Task<KeyVersion> RolloverAsync(
        Guid keySetId,
        CancellationToken cancellationToken = default);
}
