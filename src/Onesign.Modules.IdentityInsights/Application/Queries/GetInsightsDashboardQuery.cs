using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetInsightsDashboardQuery : IRequest<Result<InsightsDashboardDto>>
{
    public Guid TenantId { get; set; }
}

public class GetInsightsDashboardQueryHandler : IRequestHandler<GetInsightsDashboardQuery, Result<InsightsDashboardDto>>
{
    private readonly IInsightRepository _repository;

    public GetInsightsDashboardQueryHandler(IInsightRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<InsightsDashboardDto>> Handle(GetInsightsDashboardQuery request, CancellationToken cancellationToken)
    {
        var allInsights = await _repository.GetAllByTenantAsync(request.TenantId, cancellationToken);

        var dashboard = new InsightsDashboardDto
        {
            TotalInsights = allInsights.Count,
            OpenInsights = allInsights.Count(i => i.Status == InsightStatus.Open),
            ResolvedInsights = allInsights.Count(i => i.Status == InsightStatus.Resolved),
            DismissedInsights = allInsights.Count(i => i.Status == InsightStatus.Dismissed),
            CriticalInsights = allInsights.Count(i => i.Severity == InsightSeverity.Critical && i.Status == InsightStatus.Open),
            HighInsights = allInsights.Count(i => i.Severity == InsightSeverity.High && i.Status == InsightStatus.Open),
            MediumInsights = allInsights.Count(i => i.Severity == InsightSeverity.Medium && i.Status == InsightStatus.Open),
            LowInsights = allInsights.Count(i => i.Severity == InsightSeverity.Low && i.Status == InsightStatus.Open),
            InsightsByType = allInsights
                .Where(i => i.Status == InsightStatus.Open)
                .GroupBy(i => i.Type.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            RecentInsights = allInsights
                .OrderByDescending(i => i.CreatedAt)
                .Take(10)
                .Select(i => new InsightDetailDto
                {
                    Id = i.Id,
                    Type = i.Type.ToString(),
                    Severity = i.Severity.ToString(),
                    ScopeType = i.ScopeType,
                    ScopeId = i.ScopeId,
                    Title = i.Title,
                    MessageKey = i.MessageKey,
                    DataJson = i.DataJson,
                    Status = i.Status.ToString(),
                    CreatedAt = i.CreatedAt,
                    ResolvedAt = i.ResolvedAt,
                    ResolvedBy = i.ResolvedBy
                })
                .ToList()
        };

        return Result.Success(dashboard);
    }
}
