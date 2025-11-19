using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class GetAccessRequestDashboardStatsQueryHandler : IRequestHandler<GetAccessRequestDashboardStatsQuery, Result<AccessRequestDashboardStatsDto>>
{
    private readonly IAccessRequestRepository _repository;

    public GetAccessRequestDashboardStatsQueryHandler(IAccessRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessRequestDashboardStatsDto>> Handle(GetAccessRequestDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddDays(-30);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var requests = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var filteredRequests = requests.Where(r => r.CreatedAt >= fromDate && r.CreatedAt <= toDate).ToList();

        var stats = new AccessRequestDashboardStatsDto
        {
            TotalRequests = filteredRequests.Count,
            PendingRequests = filteredRequests.Count(r => r.Status == RequestStatus.Pending),
            ApprovedRequests = filteredRequests.Count(r => r.Status == RequestStatus.Approved),
            RejectedRequests = filteredRequests.Count(r => r.Status == RequestStatus.Rejected),
            CancelledRequests = filteredRequests.Count(r => r.Status == RequestStatus.Cancelled)
        };

        // Calculate average approval time
        var approvedWithTime = filteredRequests
            .Where(r => r.Status == RequestStatus.Approved && r.ReviewedAt.HasValue)
            .Select(r => (r.ReviewedAt!.Value - r.CreatedAt).TotalHours)
            .ToList();
        stats.AverageApprovalTimeHours = approvedWithTime.Any() ? approvedWithTime.Average() : 0;

        // Count by access type
        stats.ByAccessType = filteredRequests
            .SelectMany(r => r.Items)
            .GroupBy(i => i.AccessType.ToString())
            .Select(g => new RequestsByAccessType
            {
                AccessType = g.Key,
                Count = g.Count()
            }).ToList();

        // Last 7 days
        var last7Days = Enumerable.Range(0, 7)
            .Select(i => DateTime.UtcNow.Date.AddDays(-i))
            .Reverse()
            .ToList();

        stats.LastSevenDays = last7Days.Select(date => new RequestsByDay
        {
            Date = date,
            Submitted = requests.Count(r => r.CreatedAt.Date == date),
            Approved = requests.Count(r => r.Status == RequestStatus.Approved && r.ReviewedAt?.Date == date),
            Rejected = requests.Count(r => r.Status == RequestStatus.Rejected && r.ReviewedAt?.Date == date)
        }).ToList();

        // SLA breaches - assuming 24 hour SLA for now
        var slaHours = 24;
        stats.RequestsNearingSla = filteredRequests.Count(r =>
            r.Status == RequestStatus.Pending &&
            (DateTime.UtcNow - r.CreatedAt).TotalHours > (slaHours * 0.75) &&
            (DateTime.UtcNow - r.CreatedAt).TotalHours <= slaHours);

        stats.SlaBreaches = filteredRequests.Count(r =>
            r.Status == RequestStatus.Pending &&
            (DateTime.UtcNow - r.CreatedAt).TotalHours > slaHours);

        return Result.Success(stats);
    }
}
