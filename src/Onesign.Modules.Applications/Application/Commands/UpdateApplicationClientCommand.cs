using MediatR;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class UpdateApplicationClientCommand : IRequest<Result<ApplicationClientDto>>
{
    public Guid ApplicationId { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Domain.Enums.ApplicationType ApplicationType { get; set; }
    public Domain.Enums.GrantType GrantType { get; set; }
}

