using MediatR;
using Onesign.Modules.Applications.Application.DTOs;

namespace Onesign.Modules.Applications.Application.Queries;

public class GetApplicationDetailsQuery : IRequest<ApplicationClientDto?>
{
    public Guid ApplicationId { get; set; }
    public Guid TenantId { get; set; }
}

