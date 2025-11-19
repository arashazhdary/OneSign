namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

public class PrivilegedSessionEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string PrivilegedRolesJson { get; set; } = "[]";
    public DateTime StartedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? IpAddress { get; set; }
    public bool IsActive { get; set; }
}
