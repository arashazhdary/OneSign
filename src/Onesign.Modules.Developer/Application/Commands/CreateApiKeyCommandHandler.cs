using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class CreateApiKeyCommandHandler : IRequestHandler<CreateApiKeyCommand, Result<CreateApiKeyResultDto>>
{
    private readonly IApiKeyRepository _apiKeyRepository;
    private readonly IApiKeyService _apiKeyService;

    public CreateApiKeyCommandHandler(
        IApiKeyRepository apiKeyRepository,
        IApiKeyService apiKeyService)
    {
        _apiKeyRepository = apiKeyRepository;
        _apiKeyService = apiKeyService;
    }

    public async Task<Result<CreateApiKeyResultDto>> Handle(CreateApiKeyCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<CreateApiKeyResultDto>("API key name is required");

        // Generate secure API key
        var plainTextKey = _apiKeyService.GenerateApiKey();
        var keyHash = _apiKeyService.HashApiKey(plainTextKey);
        var keyPrefix = _apiKeyService.GetKeyPrefix(plainTextKey);

        var apiKey = new ApiKey
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            ServiceAccountId = request.ServiceAccountId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            KeyHash = keyHash,
            KeyPrefix = keyPrefix,
            Status = ApiKeyStatus.Active,
            Scopes = request.Scopes,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = request.ExpiresAt
        };

        var created = await _apiKeyRepository.AddAsync(apiKey, cancellationToken);

        return Result.Success(new CreateApiKeyResultDto
        {
            Id = created.Id,
            PlainTextKey = plainTextKey, // Only returned once
            KeyPrefix = keyPrefix,
            CreatedAt = created.CreatedAt
        });
    }
}
