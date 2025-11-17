using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetScimTokensQueryHandler : IRequestHandler<GetScimTokensQuery, Result<List<ScimTokenDto>>>
{
    private readonly IScimTokenRepository _repository;

    public GetScimTokensQueryHandler(IScimTokenRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ScimTokenDto>>> Handle(GetScimTokensQuery request, CancellationToken cancellationToken)
    {
        var tokens = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = tokens.Select(t => new ScimTokenDto
        {
            Id = t.Id,
            TenantId = t.TenantId,
            Name = t.Name,
            Status = t.Status,
            CreatedAt = t.CreatedAt,
            ExpiresAt = t.ExpiresAt,
            LastUsedAt = t.LastUsedAt
            // PlainToken is NOT included in queries for security
        }).ToList();

        return Result.Success(dtos);
    }
}
