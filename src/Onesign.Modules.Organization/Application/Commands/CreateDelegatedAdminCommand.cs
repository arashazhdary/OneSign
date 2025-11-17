using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Commands;

public class CreateDelegatedAdminCommand : IRequest<Result<DelegatedAdminDto>>
{
    public Guid TenantUserId { get; set; }
    public Guid TenantId { get; set; }
    public Guid OrgUnitId { get; set; }
    public AdminScopeType ScopeType { get; set; }
    public Guid ActorId { get; set; } // For audit logging
}

