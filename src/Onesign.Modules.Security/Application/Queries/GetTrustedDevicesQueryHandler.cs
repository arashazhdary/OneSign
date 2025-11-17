using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Queries;

public class GetTrustedDevicesQueryHandler : IRequestHandler<GetTrustedDevicesQuery, List<TrustedDeviceDto>>
{
    private readonly ITrustedDeviceRepository _repository;

    public GetTrustedDevicesQueryHandler(ITrustedDeviceRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TrustedDeviceDto>> Handle(GetTrustedDevicesQuery request, CancellationToken cancellationToken)
    {
        var devices = await _repository.GetActiveByUserIdAsync(request.UserId, cancellationToken);

        return devices.Select(d => new TrustedDeviceDto
        {
            Id = d.Id,
            DeviceName = d.DeviceName,
            CreatedAt = d.CreatedAt,
            ExpiresAt = d.ExpiresAt,
            LastUsedAt = d.LastUsedAt
        }).ToList();
    }
}
