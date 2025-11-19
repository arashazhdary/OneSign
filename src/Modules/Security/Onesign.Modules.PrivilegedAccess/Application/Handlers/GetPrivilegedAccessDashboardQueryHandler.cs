using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class GetPrivilegedAccessDashboardQueryHandler : IRequestHandler<GetPrivilegedAccessDashboardQuery, Result<PrivilegedAccessDashboardDto>>
{
    private readonly IJitGrantRepository _grantRepository;
    private readonly IPrivilegedSessionRepository _sessionRepository;
    private readonly IBreakGlassAccountRepository _breakGlassRepository;

    public GetPrivilegedAccessDashboardQueryHandler(
        IJitGrantRepository grantRepository,
        IPrivilegedSessionRepository sessionRepository,
        IBreakGlassAccountRepository breakGlassRepository)
    {
        _grantRepository = grantRepository;
        _sessionRepository = sessionRepository;
        _breakGlassRepository = breakGlassRepository;
    }

    public async Task<Result<PrivilegedAccessDashboardDto>> Handle(GetPrivilegedAccessDashboardQuery request, CancellationToken cancellationToken)
    {
        var grants = await _grantRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var sessions = await _sessionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var breakGlassAccounts = await _breakGlassRepository.GetAllAsync(cancellationToken);

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var dashboard = new PrivilegedAccessDashboardDto
        {
            ActiveJitGrants = grants.Count(g => g.Status == JitGrantStatus.Active),
            PendingJitRequests = grants.Count(g => g.Status == JitGrantStatus.Pending),
            ActiveSessions = sessions.Count(s => s.IsActive),
            BreakGlassAccounts = breakGlassAccounts.Count,
            GrantsExpiringToday = grants.Count(g =>
                g.Status == JitGrantStatus.Active &&
                g.ExpiresAt >= today &&
                g.ExpiresAt < tomorrow),

            RecentGrants = grants
                .OrderByDescending(g => g.GrantedAt)
                .Take(10)
                .Select(g => new JitGrantSummary
                {
                    Id = g.Id,
                    UserId = g.UserId,
                    RoleName = g.RoleName,
                    GrantedAt = g.GrantedAt,
                    ExpiresAt = g.ExpiresAt,
                    Status = g.Status.ToString()
                }).ToList(),

            RecentSessions = sessions
                .OrderByDescending(s => s.StartedAt)
                .Take(10)
                .Select(s => new SessionSummary
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    SessionType = "Privileged Session",
                    StartedAt = s.StartedAt,
                    DurationMinutes = s.EndedAt.HasValue
                        ? (int)(s.EndedAt.Value - s.StartedAt).TotalMinutes
                        : (int)(DateTime.UtcNow - s.StartedAt).TotalMinutes,
                    Status = s.IsActive ? "Active" : "Ended"
                }).ToList(),

            RoleUsage = grants
                .GroupBy(g => g.RoleName)
                .Select(group => new PrivilegedRoleUsage
                {
                    RoleName = group.Key,
                    GrantCount = group.Count(),
                    SessionCount = sessions.Count(s => s.UserId == group.First().UserId)
                }).ToList()
        };

        return Result.Success(dashboard);
    }
}
