using MediatR;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class AddRedirectUriCommand : IRequest<Result<RedirectUriDto>>
{
    public Guid ApplicationId { get; set; }
    public Guid TenantId { get; set; }
    public string Uri { get; set; } = string.Empty;
}

