using MediatR;
using Onesign.Modules.Identity.Application.DTOs;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetUserDetailsQuery : IRequest<TenantUserDto?>
{
    public Guid TenantUserId { get; set; }
}

