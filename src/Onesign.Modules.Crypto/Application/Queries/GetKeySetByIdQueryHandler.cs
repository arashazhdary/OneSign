using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetKeySetByIdQueryHandler : IRequestHandler<GetKeySetByIdQuery, Result<KeySetDetailDto>>
{
    private readonly DbContext _dbContext;
    private readonly ILogger<GetKeySetByIdQueryHandler> _logger;

    public GetKeySetByIdQueryHandler(
        DbContext dbContext,
        ILogger<GetKeySetByIdQueryHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Result<KeySetDetailDto>> Handle(GetKeySetByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting key set by ID: {KeySetId}", request.KeySetId);

        var keySet = await _dbContext.Set<KeySetEntity>()
            .FirstOrDefaultAsync(x => x.Id == request.KeySetId, cancellationToken);

        if (keySet == null)
        {
            _logger.LogWarning("Key set not found: {KeySetId}", request.KeySetId);
            return Result.Failure<KeySetDetailDto>("KEY_SET_NOT_FOUND", "Key set not found");
        }

        var keyVersions = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => x.KeySetId == request.KeySetId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return Result.Success(new KeySetDetailDto
        {
            Id = keySet.Id,
            ScopeType = (KeyScopeType)keySet.ScopeType,
            ScopeId = keySet.ScopeId,
            Purpose = (KeyPurpose)keySet.Purpose,
            IsDefaultForScope = keySet.IsDefaultForScope,
            CreatedAt = keySet.CreatedAt,
            KeyVersions = keyVersions.Select(x => new KeyVersionDto
            {
                Id = x.Id,
                Kid = x.Kid,
                Algorithm = x.Algorithm,
                CreatedAt = x.CreatedAt,
                ActivatedAt = x.ActivatedAt,
                ExpiredAt = x.ExpiredAt,
                State = (KeyVersionState)x.State
            }).ToList()
        });
    }
}
