using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Application.DTOs;

public class DelegatedAdminDto
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public string? UserEmail { get; set; }
    public string? UserDisplayName { get; set; }
    public Guid OrgUnitId { get; set; }
    public string OrgUnitName { get; set; } = string.Empty;
    public AdminScopeType ScopeType { get; set; }
    public DateTime CreatedAt { get; set; }
}

