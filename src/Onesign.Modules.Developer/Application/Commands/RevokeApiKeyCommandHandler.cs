using MediatR;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class RevokeApiKeyCommandHandler : IRequestHandler<RevokeApiKeyCommand, Result>
{
    private readonly IApiKeyRepository _apiKeyRepository;

    public RevokeApiKeyCommandHandler(IApiKeyRepository apiKeyRepository)
    {
        _apiKeyRepository = apiKeyRepository;
    }

    public async Task<Result> Handle(RevokeApiKeyCommand request, CancellationToken cancellationToken)
    {
        var apiKey = await _apiKeyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (apiKey == null)
            return Result.Failure("API key not found");

        if (apiKey.Status == ApiKeyStatus.Revoked)
            return Result.Failure("API key is already revoked");

        apiKey.Status = ApiKeyStatus.Revoked;
        apiKey.RevokedAt = DateTime.UtcNow;
        apiKey.RevokedReason = request.Reason;

        await _apiKeyRepository.UpdateAsync(apiKey, cancellationToken);
        return Result.Success();
    }
}
