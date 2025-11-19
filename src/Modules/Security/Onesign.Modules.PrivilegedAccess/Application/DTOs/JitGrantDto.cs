namespace Onesign.Modules.PrivilegedAccess.Application.DTOs;

public class JitGrantDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid ApprovedBy { get; set; }
    public Guid? AccessRequestId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
}

public class PrivilegedSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string PrivilegedRolesJson { get; set; } = "[]";
    public DateTime StartedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? IpAddress { get; set; }
    public bool IsActive { get; set; }
}
