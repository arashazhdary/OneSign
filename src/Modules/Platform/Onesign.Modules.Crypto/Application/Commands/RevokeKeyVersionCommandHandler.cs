using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

public class RevokeKeyVersionCommandHandler : IRequestHandler<RevokeKeyVersionCommand, Result<Unit>>
{
    private readonly IKeyRevocationService _keyRevocationService;
    private readonly ILogger<RevokeKeyVersionCommandHandler> _logger;

    public RevokeKeyVersionCommandHandler(
        IKeyRevocationService keyRevocationService,
        ILogger<RevokeKeyVersionCommandHandler> logger)
    {
        _keyRevocationService = keyRevocationService;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(RevokeKeyVersionCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Revoking KeyVersion: {KeyVersionId}, Reason: {Reason}",
            request.KeyVersionId, request.Reason);

        try
        {
            await _keyRevocationService.RevokeAsync(request.KeyVersionId, request.Reason, cancellationToken);

            _logger.LogInformation("KeyVersion revoked successfully: {KeyVersionId}", request.KeyVersionId);

            return Result.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to revoke KeyVersion: {KeyVersionId}", request.KeyVersionId);
            return Result.Failure<Unit>("KEY_REVOCATION_FAILED", ex.Message);
        }
    }
}
