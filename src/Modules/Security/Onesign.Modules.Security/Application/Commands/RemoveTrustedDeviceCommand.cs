using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Security.Application.Commands;

public class RemoveTrustedDeviceCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public Guid DeviceId { get; set; }
}
