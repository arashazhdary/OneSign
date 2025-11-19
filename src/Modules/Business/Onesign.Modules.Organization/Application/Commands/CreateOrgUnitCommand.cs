using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class CreateOrgUnitCommand : IRequest<Result<OrgUnitDto>>
{
    public Guid TenantId { get; set; }
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int? SortOrder { get; set; }
    public Guid ActorId { get; set; } // For audit logging
}

