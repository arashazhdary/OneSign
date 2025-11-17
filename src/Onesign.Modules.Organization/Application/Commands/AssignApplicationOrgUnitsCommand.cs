using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class AssignApplicationOrgUnitsCommand : IRequest<Result>
{
    public Guid ApplicationClientId { get; set; }
    public Guid TenantId { get; set; }
    public List<Guid> OrgUnitIds { get; set; } = new();
    public Guid ActorId { get; set; } // For audit logging
}

