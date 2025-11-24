using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that checks key rotation policies and rotates keys that are due,
/// managing key lifecycle and version states.
/// </summary>
public class KeyRotationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<KeyRotationWorker> _logger;
    private readonly IConfiguration _configuration;

    public KeyRotationWorker(
        IServiceProvider serviceProvider,
        ILogger<KeyRotationWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = _configuration.GetValue("BackgroundServices:KeyRotation:IntervalHours", 24);
        var checkInterval = TimeSpan.FromHours(intervalHours);

        _logger.LogInformation("KeyRotationWorker starting with interval of {Interval} hours", intervalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessKeyRotationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in KeyRotationWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessKeyRotationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get all enabled rotation policies
        var policies = await dbContext.KeyRotationPolicies
            .Where(p => p.Enabled)
            .ToListAsync(cancellationToken);

        if (!policies.Any())
        {
            _logger.LogDebug("No active key rotation policies found");
            return;
        }

        _logger.LogInformation("Checking {Count} key rotation policies", policies.Count);

        foreach (var policy in policies)
        {
            try
            {
                await CheckAndRotateKeyAsync(dbContext, policy, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing key rotation policy {PolicyId}", policy.Id);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Key rotation check completed at {Time}", DateTime.UtcNow);
    }

    private async Task CheckAndRotateKeyAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Crypto.Infrastructure.EfCore.Entities.KeyRotationPolicyEntity policy,
        CancellationToken cancellationToken)
    {
        // Get the associated KeySet
        if (!Guid.TryParse(policy.ScopeId, out var scopeGuid))
        {
            _logger.LogWarning("Invalid scope ID {ScopeId} in policy {PolicyId}", policy.ScopeId, policy.Id);
            return;
        }

        var keySet = await dbContext.KeySets
            .FirstOrDefaultAsync(k => k.Id == scopeGuid, cancellationToken);

        if (keySet == null)
        {
            _logger.LogWarning("KeySet not found for policy {PolicyId}", policy.Id);
            return;
        }

        // Get the current active key version
        // State: 0 = Pending, 1 = Active, 2 = Retired, 3 = Revoked
        var activeKey = await dbContext.KeyVersions
            .Where(k => k.KeySetId == keySet.Id && k.State == 1)
            .OrderByDescending(k => k.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeKey == null)
        {
            _logger.LogInformation("No active key found for KeySet {KeySetId}, creating new key", keySet.Id);
            await CreateNewKeyVersionAsync(dbContext, keySet.Id, policy, cancellationToken);
            return;
        }

        // Check if rotation is due
        var keyAge = DateTime.UtcNow - activeKey.ActivatedAt;
        var rotationDue = keyAge.TotalDays >= policy.RotationPeriodDays;

        if (!rotationDue)
        {
            _logger.LogDebug("Key {KeyId} does not require rotation yet (age: {AgeDays} days, rotation period: {RotationDays} days)",
                activeKey.Id, keyAge.TotalDays, policy.RotationPeriodDays);
            return;
        }

        _logger.LogInformation("Key {KeyId} is due for rotation (age: {AgeDays} days)", activeKey.Id, keyAge.TotalDays);

        // Create new key version
        var newKey = await CreateNewKeyVersionAsync(dbContext, keySet.Id, policy, cancellationToken);

        // Transition states with overlap period
        if (policy.OverlapPeriodDays > 0)
        {
            // Keep old key active during overlap period
            activeKey.ExpiredAt = DateTime.UtcNow.AddDays(policy.OverlapPeriodDays);
            _logger.LogInformation("Old key {OldKeyId} will remain active until {ExpireDate} (overlap period)",
                activeKey.Id, activeKey.ExpiredAt);
        }
        else
        {
            // Immediately retire old key
            activeKey.State = 2; // Retired
            activeKey.ExpiredAt = DateTime.UtcNow;
            _logger.LogInformation("Old key {OldKeyId} retired", activeKey.Id);
        }

        // Log the rotation event
        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.ConfigurationChanged,
            Description = $"Key rotation completed for KeySet {keySet.Id}",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                KeySetId = keySet.Id,
                OldKeyId = activeKey.Id,
                NewKeyId = newKey.Id,
                RotationPeriodDays = policy.RotationPeriodDays,
                OverlapPeriodDays = policy.OverlapPeriodDays
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
    }

    private async Task<Onesign.Modules.Crypto.Infrastructure.EfCore.Entities.KeyVersionEntity> CreateNewKeyVersionAsync(
        OnesignDbContext dbContext,
        Guid keySetId,
        Onesign.Modules.Crypto.Infrastructure.EfCore.Entities.KeyRotationPolicyEntity policy,
        CancellationToken cancellationToken)
    {
        // Generate new key material based on purpose
        // Purpose: 0 = Signing, 1 = Encryption, 2 = TokenEncryption
        var (algorithm, keyMaterial) = policy.Purpose switch
        {
            0 => GenerateSigningKey(),
            1 => GenerateEncryptionKey(),
            2 => GenerateTokenEncryptionKey(),
            _ => GenerateSigningKey() // Default to signing
        };

        var now = DateTime.UtcNow;
        var newKey = new Onesign.Modules.Crypto.Infrastructure.EfCore.Entities.KeyVersionEntity
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = $"{keySetId}-{now:yyyyMMddHHmmss}",
            Algorithm = algorithm,
            KeyMaterial = keyMaterial,
            CreatedAt = now,
            ActivatedAt = now,
            State = 1 // Active
        };

        dbContext.KeyVersions.Add(newKey);

        _logger.LogInformation("Created new key version {KeyId} with algorithm {Algorithm} for KeySet {KeySetId}",
            newKey.Id, algorithm, keySetId);

        // Also retire any keys that have passed their overlap period
        var expiredKeys = await dbContext.KeyVersions
            .Where(k => k.KeySetId == keySetId &&
                       k.State == 1 && // Still active
                       k.ExpiredAt != null &&
                       k.ExpiredAt <= now)
            .ToListAsync(cancellationToken);

        foreach (var expiredKey in expiredKeys)
        {
            expiredKey.State = 2; // Retired
            _logger.LogInformation("Retired expired key {KeyId}", expiredKey.Id);
        }

        return newKey;
    }

    private static (string Algorithm, byte[] KeyMaterial) GenerateSigningKey()
    {
        // Generate RSA key pair for signing
        using var rsa = RSA.Create(2048);
        return ("RS256", rsa.ExportRSAPrivateKey());
    }

    private static (string Algorithm, byte[] KeyMaterial) GenerateEncryptionKey()
    {
        // Generate AES key for encryption
        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.GenerateKey();
        return ("A256GCM", aes.Key);
    }

    private static (string Algorithm, byte[] KeyMaterial) GenerateTokenEncryptionKey()
    {
        // Generate key for token encryption (JWE)
        using var rsa = RSA.Create(2048);
        return ("RSA-OAEP-256", rsa.ExportRSAPrivateKey());
    }
}
