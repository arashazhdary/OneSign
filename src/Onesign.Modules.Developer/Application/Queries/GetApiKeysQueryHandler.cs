using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Queries;

public class GetApiKeysQueryHandler : IRequestHandler<GetApiKeysQuery, Result<List<ApiKeyDto>>>
{
    private readonly IApiKeyRepository _apiKeyRepository;

    public GetApiKeysQueryHandler(IApiKeyRepository apiKeyRepository)
    {
        _apiKeyRepository = apiKeyRepository;
    }

    public async Task<Result<List<ApiKeyDto>>> Handle(GetApiKeysQuery request, CancellationToken cancellationToken)
    {
        var apiKeys = request.ServiceAccountId.HasValue
            ? await _apiKeyRepository.GetByServiceAccountIdAsync(request.ServiceAccountId.Value, cancellationToken)
            : await _apiKeyRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = apiKeys.Select(k => new ApiKeyDto
        {
            Id = k.Id,
            TenantId = k.TenantId,
            ServiceAccountId = k.ServiceAccountId,
            Name = k.Name,
            Description = k.Description,
            KeyPrefix = k.KeyPrefix,
            Status = k.Status,
            Scopes = k.Scopes,
            CreatedAt = k.CreatedAt,
            ExpiresAt = k.ExpiresAt,
            LastUsedAt = k.LastUsedAt,
            RevokedAt = k.RevokedAt,
            RevokedReason = k.RevokedReason
        }).ToList();

        return Result.Success(dtos);
    }
}
