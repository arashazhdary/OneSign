using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class RemoveRedirectUriCommand : IRequest<Result<bool>>
{
    public Guid RedirectUriId { get; set; }
    public Guid TenantId { get; set; }
}

