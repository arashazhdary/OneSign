using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Queries;

public class GetSecurityPolicyQuery : IRequest<SecurityPolicyDto?>
{
    public Guid TenantId { get; set; }
}
