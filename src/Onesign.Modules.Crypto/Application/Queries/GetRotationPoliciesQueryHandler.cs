using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetRotationPoliciesQueryHandler : IRequestHandler<GetRotationPoliciesQuery, IReadOnlyList<RotationPolicyDto>>
{
    private readonly DbContext _dbContext;
    private readonly ILogger<GetRotationPoliciesQueryHandler> _logger;

    public GetRotationPoliciesQueryHandler(
        DbContext dbContext,
        ILogger<GetRotationPoliciesQueryHandler> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IReadOnlyList<RotationPolicyDto>> Handle(GetRotationPoliciesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting rotation policies with filters - ScopeType: {ScopeType}, ScopeId: {ScopeId}, Enabled: {Enabled}",
            request.ScopeType, request.ScopeId, request.Enabled);

        var query = _dbContext.Set<KeyRotationPolicyEntity>().AsQueryable();

        if (request.ScopeType.HasValue)
        {
            query = query.Where(x => x.ScopeType == (int)request.ScopeType.Value);
        }

        if (!string.IsNullOrEmpty(request.ScopeId))
        {
            query = query.Where(x => x.ScopeId == request.ScopeId);
        }

        if (request.Enabled.HasValue)
        {
            query = query.Where(x => x.Enabled == request.Enabled.Value);
        }

        var policies = await query.ToListAsync(cancellationToken);

        return policies.Select(x => new RotationPolicyDto
        {
            Id = x.Id,
            ScopeType = (KeyScopeType)x.ScopeType,
            ScopeId = x.ScopeId,
            Purpose = (KeyPurpose)x.Purpose,
            RotationPeriodDays = x.RotationPeriodDays,
            OverlapPeriodDays = x.OverlapPeriodDays,
            Enabled = x.Enabled
        }).ToList();
    }
}
