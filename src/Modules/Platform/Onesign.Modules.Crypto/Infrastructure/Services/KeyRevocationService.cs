using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

public class KeyRevocationService : IKeyRevocationService
{
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly ILogger<KeyRevocationService> _logger;

    public KeyRevocationService(
        IKeyVersionRepository keyVersionRepository,
        ILogger<KeyRevocationService> logger)
    {
        _keyVersionRepository = keyVersionRepository;
        _logger = logger;
    }

    public async Task RevokeAsync(
        Guid keyVersionId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var keyVersion = await _keyVersionRepository.GetByIdAsync(keyVersionId, cancellationToken);
        if (keyVersion == null)
        {
            _logger.LogWarning("Key version {KeyVersionId} not found for revocation", keyVersionId);
            return;
        }

        if (keyVersion.State == KeyVersionState.Revoked)
        {
            _logger.LogInformation("Key version {KeyVersionId} is already revoked", keyVersionId);
            return;
        }

        keyVersion.State = KeyVersionState.Revoked;
        keyVersion.ExpiredAt = DateTime.UtcNow;

        await _keyVersionRepository.UpdateAsync(keyVersion, cancellationToken);

        _logger.LogInformation(
            "Key version {KeyVersionId} revoked. Reason: {Reason}",
            keyVersionId, reason);
    }
}
