using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class DeleteOrgUnitCommand : IRequest<Result>
{
    public Guid OrgUnitId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ActorId { get; set; } // For audit logging
}

