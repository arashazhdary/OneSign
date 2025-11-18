using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Queries;

public class GetTrustedDevicesQuery : IRequest<List<TrustedDeviceDto>>
{
    public Guid UserId { get; set; }
}
