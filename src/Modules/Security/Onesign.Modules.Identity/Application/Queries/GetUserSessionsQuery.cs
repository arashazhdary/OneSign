using MediatR;
using Onesign.Modules.Identity.Application.DTOs;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetUserSessionsQuery : IRequest<List<UserSessionDto>>
{
    public Guid TenantUserId { get; set; }
    public string? CurrentSessionToken { get; set; }
}
