using Onesign.Modules.Crypto.Domain.Entities;

namespace Onesign.Modules.Crypto.Domain.Services;

/// <summary>
/// Engine for managing automatic key rotation based on policies.
/// </summary>
public interface IKeyRotationEngine
{
    /// <summary>
    /// Checks all rotation policies and rotates keys that are due.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of rotation results</returns>
    Task<IEnumerable<KeyRotationResult>> ProcessRotationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a specific key set requires rotation based on its policy.
    /// </summary>
    /// <param name="keySetId">The key set to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if rotation is required</returns>
    Task<bool> IsRotationRequiredAsync(Guid keySetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Forces immediate rotation of a key set regardless of policy.
    /// </summary>
    /// <param name="keySetId">The key set to rotate</param>
    /// <param name="reason">Reason for the forced rotation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The rotation result</returns>
    Task<KeyRotationResult> ForceRotationAsync(
        Guid keySetId,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Schedules a rotation for a specific time.
    /// </summary>
    /// <param name="keySetId">The key set to rotate</param>
    /// <param name="scheduledTime">When to perform the rotation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task ScheduleRotationAsync(
        Guid keySetId,
        DateTime scheduledTime,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the next scheduled rotation time for a key set.
    /// </summary>
    /// <param name="keySetId">The key set to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Next rotation time, or null if no rotation is scheduled</returns>
    Task<DateTime?> GetNextRotationTimeAsync(Guid keySetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retires old key versions that have passed their overlap period.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of keys retired</returns>
    Task<int> RetireExpiredKeysAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a key rotation operation.
/// </summary>
public class KeyRotationResult
{
    /// <summary>
    /// The key set that was rotated.
    /// </summary>
    public Guid KeySetId { get; set; }

    /// <summary>
    /// Whether the rotation was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The new key version ID if rotation was successful.
    /// </summary>
    public Guid? NewKeyVersionId { get; set; }

    /// <summary>
    /// The previous key version ID.
    /// </summary>
    public Guid? PreviousKeyVersionId { get; set; }

    /// <summary>
    /// The new key identifier (kid).
    /// </summary>
    public string? NewKid { get; set; }

    /// <summary>
    /// When the rotation was performed.
    /// </summary>
    public DateTime RotatedAt { get; set; }

    /// <summary>
    /// Reason for the rotation.
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Error message if rotation failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// When the old key will be retired (if overlap period is configured).
    /// </summary>
    public DateTime? OldKeyRetirementDate { get; set; }
}
