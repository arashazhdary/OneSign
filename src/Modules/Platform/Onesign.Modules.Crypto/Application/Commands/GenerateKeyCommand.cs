using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

/// <summary>
/// Command to generate a new cryptographic key.
/// </summary>
public class GenerateKeyCommand : IRequest<Result<GenerateKeyResponse>>
{
    /// <summary>
    /// The key set to add the key to.
    /// </summary>
    public Guid KeySetId { get; set; }

    /// <summary>
    /// The purpose of the key.
    /// </summary>
    public KeyPurpose Purpose { get; set; }

    /// <summary>
    /// The algorithm to use (e.g., RS256, ES256, A256GCM).
    /// </summary>
    public string Algorithm { get; set; } = "RS256";

    /// <summary>
    /// Whether to activate the key immediately.
    /// </summary>
    public bool ActivateImmediately { get; set; } = true;
}

/// <summary>
/// Response from key generation.
/// </summary>
public class GenerateKeyResponse
{
    /// <summary>
    /// The generated key version ID.
    /// </summary>
    public Guid KeyVersionId { get; set; }

    /// <summary>
    /// The key identifier (kid).
    /// </summary>
    public string Kid { get; set; } = string.Empty;

    /// <summary>
    /// The algorithm used.
    /// </summary>
    public string Algorithm { get; set; } = string.Empty;

    /// <summary>
    /// When the key was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the key was activated.
    /// </summary>
    public DateTime? ActivatedAt { get; set; }

    /// <summary>
    /// Current state of the key.
    /// </summary>
    public string State { get; set; } = string.Empty;
}

/// <summary>
/// Handler for generating new cryptographic keys.
/// </summary>
public class GenerateKeyCommandHandler : IRequestHandler<GenerateKeyCommand, Result<GenerateKeyResponse>>
{
    private readonly IKeyGenerator _keyGenerator;
    private readonly ILogger<GenerateKeyCommandHandler> _logger;

    public GenerateKeyCommandHandler(
        IKeyGenerator keyGenerator,
        ILogger<GenerateKeyCommandHandler> logger)
    {
        _keyGenerator = keyGenerator;
        _logger = logger;
    }

    public async Task<Result<GenerateKeyResponse>> Handle(GenerateKeyCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Generating key for KeySet {KeySetId} with algorithm {Algorithm} and purpose {Purpose}",
            request.KeySetId, request.Algorithm, request.Purpose);

        try
        {
            if (!_keyGenerator.IsAlgorithmSupported(request.Algorithm, request.Purpose))
            {
                var supportedAlgorithms = _keyGenerator.GetSupportedAlgorithms(request.Purpose);
                return Result.Failure<GenerateKeyResponse>(
                    "ALGORITHM_NOT_SUPPORTED",
                    $"Algorithm {request.Algorithm} is not supported for {request.Purpose}. Supported: {string.Join(", ", supportedAlgorithms)}");
            }

            var keyVersion = await _keyGenerator.GenerateAsync(
                request.KeySetId,
                request.Purpose,
                request.Algorithm,
                cancellationToken);

            _logger.LogInformation(
                "Key generated successfully. KeyVersionId: {KeyVersionId}, Kid: {Kid}",
                keyVersion.Id, keyVersion.Kid);

            return Result.Success(new GenerateKeyResponse
            {
                KeyVersionId = keyVersion.Id,
                Kid = keyVersion.Kid,
                Algorithm = keyVersion.Algorithm,
                CreatedAt = keyVersion.CreatedAt,
                ActivatedAt = keyVersion.ActivatedAt,
                State = keyVersion.State.ToString()
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Failed to generate key for KeySet {KeySetId}", request.KeySetId);
            return Result.Failure<GenerateKeyResponse>("KEY_GENERATION_FAILED", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating key for KeySet {KeySetId}", request.KeySetId);
            return Result.Failure<GenerateKeyResponse>("KEY_GENERATION_ERROR", "An unexpected error occurred while generating the key");
        }
    }
}
