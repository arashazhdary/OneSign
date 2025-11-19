using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class DeleteApplicationClientCommand : IRequest<Result<bool>>
{
    public Guid ApplicationId { get; set; }
    public Guid TenantId { get; set; }
}

