namespace Onesign.Modules.PrivilegedAccess.Application.DTOs;

public class PrivilegedAccessDashboardDto
{
    public int ActiveJitGrants { get; set; }
    public int PendingJitRequests { get; set; }
    public int ActiveSessions { get; set; }
    public int BreakGlassAccounts { get; set; }
    public int GrantsExpiringToday { get; set; }
    public List<JitGrantSummary> RecentGrants { get; set; } = new();
    public List<SessionSummary> RecentSessions { get; set; } = new();
    public List<PrivilegedRoleUsage> RoleUsage { get; set; } = new();
}

public class JitGrantSummary
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class SessionSummary
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string SessionType { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PrivilegedRoleUsage
{
    public string RoleName { get; set; } = string.Empty;
    public int GrantCount { get; set; }
    public int SessionCount { get; set; }
}
