using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Services;

public interface IKeyStore
{
    Task<KeyVersion> GenerateKeyAsync(
        Guid keySetId,
        string algorithm,
        CancellationToken cancellationToken = default);

    Task<byte[]> GetPrivateKeyAsync(
        Guid keyVersionId,
        CancellationToken cancellationToken = default);

    Task<byte[]> GetPublicKeyAsync(
        Guid keyVersionId,
        CancellationToken cancellationToken = default);
}
