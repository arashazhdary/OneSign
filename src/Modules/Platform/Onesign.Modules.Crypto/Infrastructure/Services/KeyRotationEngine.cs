using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

/// <summary>
/// Engine for managing automatic key rotation based on policies.
/// </summary>
public class KeyRotationEngine : IKeyRotationEngine
{
    private readonly IKeyRotationPolicyRepository _policyRepository;
    private readonly IKeySetRepository _keySetRepository;
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly IKeyGenerator _keyGenerator;
    private readonly ILogger<KeyRotationEngine> _logger;
    private readonly Dictionary<Guid, DateTime> _scheduledRotations = new();

    public KeyRotationEngine(
        IKeyRotationPolicyRepository policyRepository,
        IKeySetRepository keySetRepository,
        IKeyVersionRepository keyVersionRepository,
        IKeyGenerator keyGenerator,
        ILogger<KeyRotationEngine> logger)
    {
        _policyRepository = policyRepository;
        _keySetRepository = keySetRepository;
        _keyVersionRepository = keyVersionRepository;
        _keyGenerator = keyGenerator;
        _logger = logger;
    }

    public async Task<IEnumerable<KeyRotationResult>> ProcessRotationsAsync(CancellationToken cancellationToken = default)
    {
        var results = new List<KeyRotationResult>();
        var policies = await _policyRepository.GetEnabledPoliciesAsync(cancellationToken);

        _logger.LogInformation("Processing {Count} key rotation policies", policies.Count());

        foreach (var policy in policies)
        {
            try
            {
                if (await IsRotationRequiredForPolicyAsync(policy, cancellationToken))
                {
                    var result = await RotateKeySetAsync(policy, "Scheduled rotation", cancellationToken);
                    results.Add(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing rotation for policy {PolicyId}", policy.Id);
                results.Add(new KeyRotationResult
                {
                    KeySetId = Guid.TryParse(policy.ScopeId, out var keySetId) ? keySetId : Guid.Empty,
                    Success = false,
                    ErrorMessage = ex.Message,
                    RotatedAt = DateTime.UtcNow,
                    Reason = "Scheduled rotation"
                });
            }
        }

        await RetireExpiredKeysAsync(cancellationToken);

        _logger.LogInformation("Key rotation processing completed. Results: {SuccessCount} succeeded, {FailCount} failed",
            results.Count(r => r.Success), results.Count(r => !r.Success));

        return results;
    }

    public async Task<bool> IsRotationRequiredAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        var policy = await _policyRepository.GetByKeySetIdAsync(keySetId, cancellationToken);
        if (policy == null || !policy.Enabled)
        {
            return false;
        }

        return await IsRotationRequiredForPolicyAsync(policy, cancellationToken);
    }

    public async Task<KeyRotationResult> ForceRotationAsync(
        Guid keySetId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Forcing key rotation for KeySet {KeySetId}. Reason: {Reason}", keySetId, reason);

        var policy = await _policyRepository.GetByKeySetIdAsync(keySetId, cancellationToken);
        if (policy == null)
        {
            var keySet = await _keySetRepository.GetByIdAsync(keySetId, cancellationToken);
            if (keySet == null)
            {
                return new KeyRotationResult
                {
                    KeySetId = keySetId,
                    Success = false,
                    ErrorMessage = "KeySet not found",
                    RotatedAt = DateTime.UtcNow,
                    Reason = reason
                };
            }

            policy = new KeyRotationPolicy
            {
                Id = Guid.NewGuid(),
                ScopeId = keySetId,
                ScopeType = KeyScopeType.KeySet,
                Purpose = keySet.Purpose,
                RotationPeriodDays = 90,
                OverlapPeriodDays = 7,
                Enabled = true
            };
        }

        return await RotateKeySetAsync(policy, reason, cancellationToken);
    }

    public Task ScheduleRotationAsync(
        Guid keySetId,
        DateTime scheduledTime,
        CancellationToken cancellationToken = default)
    {
        _scheduledRotations[keySetId] = scheduledTime;
        _logger.LogInformation("Scheduled rotation for KeySet {KeySetId} at {ScheduledTime}", keySetId, scheduledTime);
        return Task.CompletedTask;
    }

    public async Task<DateTime?> GetNextRotationTimeAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        if (_scheduledRotations.TryGetValue(keySetId, out var scheduledTime))
        {
            return scheduledTime;
        }

        var policy = await _policyRepository.GetByKeySetIdAsync(keySetId, cancellationToken);
        if (policy == null || !policy.Enabled)
        {
            return null;
        }

        var activeKey = await _keyVersionRepository.GetActiveKeyAsync(keySetId, cancellationToken);
        if (activeKey == null)
        {
            return DateTime.UtcNow;
        }

        return activeKey.ActivatedAt.AddDays(policy.RotationPeriodDays);
    }

    public async Task<int> RetireExpiredKeysAsync(CancellationToken cancellationToken = default)
    {
        var expiredKeys = await _keyVersionRepository.GetExpiredKeysAsync(cancellationToken);
        var retiredCount = 0;

        foreach (var key in expiredKeys)
        {
            key.State = KeyVersionState.Retired;
            await _keyVersionRepository.UpdateAsync(key, cancellationToken);
            retiredCount++;

            _logger.LogInformation("Retired expired key {KeyVersionId} ({Kid})", key.Id, key.Kid);
        }

        return retiredCount;
    }

    private async Task<bool> IsRotationRequiredForPolicyAsync(
        KeyRotationPolicy policy,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(policy.ScopeId, out var keySetId))
        {
            return false;
        }

        var activeKey = await _keyVersionRepository.GetActiveKeyAsync(keySetId, cancellationToken);
        if (activeKey == null)
        {
            return true;
        }

        var keyAge = DateTime.UtcNow - activeKey.ActivatedAt;
        return keyAge.TotalDays >= policy.RotationPeriodDays;
    }

    private async Task<KeyRotationResult> RotateKeySetAsync(
        KeyRotationPolicy policy,
        string reason,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(policy.ScopeId, out var keySetId))
        {
            return new KeyRotationResult
            {
                KeySetId = Guid.Empty,
                Success = false,
                ErrorMessage = "Invalid KeySet ID format",
                RotatedAt = DateTime.UtcNow,
                Reason = reason
            };
        }

        var keySet = await _keySetRepository.GetByIdAsync(keySetId, cancellationToken);
        if (keySet == null)
        {
            return new KeyRotationResult
            {
                KeySetId = keySetId,
                Success = false,
                ErrorMessage = "KeySet not found",
                RotatedAt = DateTime.UtcNow,
                Reason = reason
            };
        }

        var activeKey = await _keyVersionRepository.GetActiveKeyAsync(keySetId, cancellationToken);

        var algorithm = activeKey?.Algorithm ?? GetDefaultAlgorithm(policy.Purpose);
        var newKey = await _keyGenerator.GenerateAsync(keySetId, policy.Purpose, algorithm, cancellationToken);

        DateTime? oldKeyRetirementDate = null;

        if (activeKey != null)
        {
            if (policy.OverlapPeriodDays > 0)
            {
                activeKey.ExpiredAt = DateTime.UtcNow.AddDays(policy.OverlapPeriodDays);
                oldKeyRetirementDate = activeKey.ExpiredAt;
                await _keyVersionRepository.UpdateAsync(activeKey, cancellationToken);

                _logger.LogInformation(
                    "Old key {OldKeyId} will be retired on {RetirementDate}",
                    activeKey.Id, activeKey.ExpiredAt);
            }
            else
            {
                activeKey.State = KeyVersionState.Retired;
                activeKey.ExpiredAt = DateTime.UtcNow;
                await _keyVersionRepository.UpdateAsync(activeKey, cancellationToken);

                _logger.LogInformation("Old key {OldKeyId} retired immediately", activeKey.Id);
            }
        }

        _scheduledRotations.Remove(keySetId);

        _logger.LogInformation(
            "Key rotation completed for KeySet {KeySetId}. New key: {NewKeyId} ({NewKid})",
            keySetId, newKey.Id, newKey.Kid);

        return new KeyRotationResult
        {
            KeySetId = keySetId,
            Success = true,
            NewKeyVersionId = newKey.Id,
            PreviousKeyVersionId = activeKey?.Id,
            NewKid = newKey.Kid,
            RotatedAt = DateTime.UtcNow,
            Reason = reason,
            OldKeyRetirementDate = oldKeyRetirementDate
        };
    }

    private static string GetDefaultAlgorithm(KeyPurpose purpose)
    {
        return purpose switch
        {
            KeyPurpose.Signing => "RS256",
            KeyPurpose.Encryption => "A256GCM",
            KeyPurpose.TokenEncryption => "RSA-OAEP-256",
            _ => "RS256"
        };
    }
}
