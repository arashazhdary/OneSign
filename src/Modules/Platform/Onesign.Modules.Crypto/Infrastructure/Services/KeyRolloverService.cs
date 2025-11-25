using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

public class KeyRolloverService : IKeyRolloverService
{
    private readonly IKeySetRepository _keySetRepository;
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly IKeyGenerator _keyGenerator;
    private readonly ILogger<KeyRolloverService> _logger;

    public KeyRolloverService(
        IKeySetRepository keySetRepository,
        IKeyVersionRepository keyVersionRepository,
        IKeyGenerator keyGenerator,
        ILogger<KeyRolloverService> logger)
    {
        _keySetRepository = keySetRepository;
        _keyVersionRepository = keyVersionRepository;
        _keyGenerator = keyGenerator;
        _logger = logger;
    }

    public async Task<KeyVersion> RolloverAsync(
        Guid keySetId,
        CancellationToken cancellationToken = default)
    {
        var keySet = await _keySetRepository.GetByIdAsync(keySetId, cancellationToken);
        if (keySet == null)
        {
            throw new InvalidOperationException($"KeySet {keySetId} not found");
        }

        // Retire the current active key
        var activeKey = await _keyVersionRepository.GetActiveByKeySetIdAsync(keySetId, cancellationToken);
        if (activeKey != null)
        {
            activeKey.State = KeyVersionState.Retired;
            activeKey.ExpiredAt = DateTime.UtcNow.AddDays(30); // Grace period
            await _keyVersionRepository.UpdateAsync(activeKey, cancellationToken);

            _logger.LogInformation(
                "Key version {KeyVersionId} retired during rollover",
                activeKey.Id);
        }

        // Generate new key
        // Get default algorithm based on purpose
        var supportedAlgorithms = _keyGenerator.GetSupportedAlgorithms(keySet.Purpose);
        var algorithm = supportedAlgorithms.FirstOrDefault() ?? "RS256";

        var newKey = await _keyGenerator.GenerateAsync(
            keySetId,
            keySet.Purpose,
            algorithm,
            cancellationToken);

        _logger.LogInformation(
            "New key version {KeyVersionId} created for KeySet {KeySetId}",
            newKey.Id, keySetId);

        return newKey;
    }
}
