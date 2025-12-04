using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class MicrosoftLoginCommand : IRequest<Result<LoginResponse>>
{
    public Guid TenantId { get; set; }
    public string IdToken { get; set; } = string.Empty;
    public Guid? ClientId { get; set; }
}
