using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetCurrentUserScopeQuery : IRequest<Result<CurrentUserScopeDto>>
{
    public Guid TenantUserId { get; set; }
}
