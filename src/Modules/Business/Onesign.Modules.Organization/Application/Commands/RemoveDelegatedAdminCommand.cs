using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class RemoveDelegatedAdminCommand : IRequest<Result>
{
    public Guid DelegatedAdminId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ActorId { get; set; } // For audit logging
}

