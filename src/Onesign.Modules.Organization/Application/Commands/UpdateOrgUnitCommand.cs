using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class UpdateOrgUnitCommand : IRequest<Result<OrgUnitDto>>
{
    public Guid OrgUnitId { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? SortOrder { get; set; }
    public Guid ActorId { get; set; } // For audit logging
}

