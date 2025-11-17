using Onesign.Modules.Organization.Domain.Enums;

namespace Onesign.Modules.Organization.Application.DTOs;

public class CreateDelegatedAdminRequest
{
    public Guid TenantUserId { get; set; }
    public Guid OrgUnitId { get; set; }
    public AdminScopeType ScopeType { get; set; }
}

