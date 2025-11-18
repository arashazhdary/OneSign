using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

public class RolloverKeyCommandHandler : IRequestHandler<RolloverKeyCommand, Result<RolloverKeyResponse>>
{
    private readonly IKeyRolloverService _keyRolloverService;
    private readonly ILogger<RolloverKeyCommandHandler> _logger;

    public RolloverKeyCommandHandler(
        IKeyRolloverService keyRolloverService,
        ILogger<RolloverKeyCommandHandler> logger)
    {
        _keyRolloverService = keyRolloverService;
        _logger = logger;
    }

    public async Task<Result<RolloverKeyResponse>> Handle(RolloverKeyCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Rolling over key for KeySet: {KeySetId}", request.KeySetId);

        try
        {
            var newKeyVersion = await _keyRolloverService.RolloverAsync(request.KeySetId, cancellationToken);

            _logger.LogInformation("Key rollover completed. New KeyVersion: {KeyVersionId}, Kid: {Kid}",
                newKeyVersion.Id, newKeyVersion.Kid);

            return Result.Success(new RolloverKeyResponse
            {
                NewKeyVersionId = newKeyVersion.Id,
                Kid = newKeyVersion.Kid,
                ActivatedAt = newKeyVersion.ActivatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to rollover key for KeySet: {KeySetId}", request.KeySetId);
            return Result.Failure<RolloverKeyResponse>("KEY_ROLLOVER_FAILED", ex.Message);
        }
    }
}
