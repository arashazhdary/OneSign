using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetUserSecurityContextQuery : IRequest<Result<UserSecurityContextDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}
