using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetKeySetsQueryHandler : IRequestHandler<GetKeySetsQuery, IReadOnlyList<KeySetDto>>
{
    private readonly DbContext _dbContext;
    private readonly ILogger<GetKeySetsQueryHandler> _logger;

    public GetKeySetsQueryHandler(
        DbContext dbContext,
        ILogger<GetKeySetsQueryHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IReadOnlyList<KeySetDto>> Handle(GetKeySetsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting key sets with filters - ScopeType: {ScopeType}, ScopeId: {ScopeId}, Purpose: {Purpose}",
            request.ScopeType, request.ScopeId, request.Purpose);

        var query = _dbContext.Set<KeySetEntity>().AsQueryable();

        if (request.ScopeType.HasValue)
        {
            query = query.Where(x => x.ScopeType == (int)request.ScopeType.Value);
        }

        if (!string.IsNullOrEmpty(request.ScopeId))
        {
            query = query.Where(x => x.ScopeId == request.ScopeId);
        }

        if (request.Purpose.HasValue)
        {
            query = query.Where(x => x.Purpose == (int)request.Purpose.Value);
        }

        var keySets = await query.ToListAsync(cancellationToken);

        var keySetIds = keySets.Select(x => x.Id).ToList();
        var keyVersionCounts = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => keySetIds.Contains(x.KeySetId) && x.State == (int)KeyVersionState.Active)
            .GroupBy(x => x.KeySetId)
            .Select(g => new { KeySetId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.KeySetId, x => x.Count, cancellationToken);

        return keySets.Select(x => new KeySetDto
        {
            Id = x.Id,
            ScopeType = (KeyScopeType)x.ScopeType,
            ScopeId = x.ScopeId,
            Purpose = (KeyPurpose)x.Purpose,
            IsDefaultForScope = x.IsDefaultForScope,
            CreatedAt = x.CreatedAt,
            ActiveKeyVersionsCount = keyVersionCounts.GetValueOrDefault(x.Id, 0)
        }).ToList();
    }
}
