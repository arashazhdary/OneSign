using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class AssignUserOrgUnitsCommand : IRequest<Result>
{
    public Guid TenantUserId { get; set; }
    public Guid TenantId { get; set; }
    public Guid PrimaryOrgUnitId { get; set; }
    public List<Guid> SecondaryOrgUnitIds { get; set; } = new();
    public Guid ActorId { get; set; } // For audit logging
}

