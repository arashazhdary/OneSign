using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

/// <summary>
/// Command to rotate a key set's active key.
/// </summary>
public class RotateKeyCommand : IRequest<Result<RotateKeyResponse>>
{
    /// <summary>
    /// The key set to rotate.
    /// </summary>
    public Guid KeySetId { get; set; }

    /// <summary>
    /// Reason for the rotation.
    /// </summary>
    public string Reason { get; set; } = "Manual rotation";

    /// <summary>
    /// Override algorithm for the new key (optional).
    /// </summary>
    public string? Algorithm { get; set; }

    /// <summary>
    /// Whether to force rotation regardless of policy.
    /// </summary>
    public bool Force { get; set; } = false;
}

/// <summary>
/// Response from key rotation.
/// </summary>
public class RotateKeyResponse
{
    /// <summary>
    /// The new key version ID.
    /// </summary>
    public Guid NewKeyVersionId { get; set; }

    /// <summary>
    /// The new key identifier (kid).
    /// </summary>
    public string NewKid { get; set; } = string.Empty;

    /// <summary>
    /// The previous key version ID.
    /// </summary>
    public Guid? PreviousKeyVersionId { get; set; }

    /// <summary>
    /// When the rotation occurred.
    /// </summary>
    public DateTime RotatedAt { get; set; }

    /// <summary>
    /// When the old key will be retired.
    /// </summary>
    public DateTime? OldKeyRetirementDate { get; set; }

    /// <summary>
    /// Reason for the rotation.
    /// </summary>
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for rotating keys.
/// </summary>
public class RotateKeyCommandHandler : IRequestHandler<RotateKeyCommand, Result<RotateKeyResponse>>
{
    private readonly IKeyRotationEngine _rotationEngine;
    private readonly ILogger<RotateKeyCommandHandler> _logger;

    public RotateKeyCommandHandler(
        IKeyRotationEngine rotationEngine,
        ILogger<RotateKeyCommandHandler> logger)
    {
        _rotationEngine = rotationEngine;
        _logger = logger;
    }

    public async Task<Result<RotateKeyResponse>> Handle(RotateKeyCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Rotating key for KeySet {KeySetId}. Reason: {Reason}, Force: {Force}",
            request.KeySetId, request.Reason, request.Force);

        try
        {
            if (!request.Force)
            {
                var isRequired = await _rotationEngine.IsRotationRequiredAsync(request.KeySetId, cancellationToken);
                if (!isRequired)
                {
                    var nextRotation = await _rotationEngine.GetNextRotationTimeAsync(request.KeySetId, cancellationToken);
                    return Result.Failure<RotateKeyResponse>(
                        "ROTATION_NOT_REQUIRED",
                        $"Key rotation is not required at this time. Next scheduled rotation: {nextRotation?.ToString("O") ?? "Not scheduled"}");
                }
            }

            var result = await _rotationEngine.ForceRotationAsync(request.KeySetId, request.Reason, cancellationToken);

            if (!result.Success)
            {
                return Result.Failure<RotateKeyResponse>("KEY_ROTATION_FAILED", result.ErrorMessage ?? "Key rotation failed");
            }

            _logger.LogInformation(
                "Key rotation completed. New KeyVersionId: {NewKeyVersionId}, Kid: {NewKid}",
                result.NewKeyVersionId, result.NewKid);

            return Result.Success(new RotateKeyResponse
            {
                NewKeyVersionId = result.NewKeyVersionId!.Value,
                NewKid = result.NewKid!,
                PreviousKeyVersionId = result.PreviousKeyVersionId,
                RotatedAt = result.RotatedAt,
                OldKeyRetirementDate = result.OldKeyRetirementDate,
                Reason = result.Reason
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error rotating key for KeySet {KeySetId}", request.KeySetId);
            return Result.Failure<RotateKeyResponse>("KEY_ROTATION_ERROR", "An unexpected error occurred during key rotation");
        }
    }
}
