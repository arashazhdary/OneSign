using System.Text.Json;
using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class UpdateUserSecurityContextCommandHandler : IRequestHandler<UpdateUserSecurityContextCommand, Result<UserSecurityContextDto>>
{
    private readonly IUserSecurityContextRepository _repository;

    public UpdateUserSecurityContextCommandHandler(IUserSecurityContextRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<UserSecurityContextDto>> Handle(UpdateUserSecurityContextCommand request, CancellationToken cancellationToken)
    {
        var context = await _repository.GetByUserIdAsync(request.TenantId, request.UserId, cancellationToken);

        if (context == null)
        {
            context = new UserSecurityContext
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                UserId = request.UserId,
                CurrentRiskScore = 0,
                RiskFactorsJson = "[]",
                LastLoginLocation = request.LastLoginLocation,
                LastLoginDevice = request.LastLoginDevice,
                TrustedDevicesJson = request.TrustedDevices != null ? JsonSerializer.Serialize(request.TrustedDevices) : "[]",
                TrustedLocationsJson = request.TrustedLocations != null ? JsonSerializer.Serialize(request.TrustedLocations) : "[]",
                UpdatedAt = DateTime.UtcNow
            };
            await _repository.AddAsync(context, cancellationToken);
        }
        else
        {
            if (request.LastLoginLocation != null)
                context.LastLoginLocation = request.LastLoginLocation;
            if (request.LastLoginDevice != null)
                context.LastLoginDevice = request.LastLoginDevice;
            if (request.TrustedDevices != null)
                context.TrustedDevicesJson = JsonSerializer.Serialize(request.TrustedDevices);
            if (request.TrustedLocations != null)
                context.TrustedLocationsJson = JsonSerializer.Serialize(request.TrustedLocations);
            context.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(context, cancellationToken);
        }

        var dto = new UserSecurityContextDto
        {
            Id = context.Id,
            TenantId = context.TenantId,
            UserId = context.UserId,
            CurrentRiskScore = context.CurrentRiskScore,
            RiskFactorsJson = context.RiskFactorsJson,
            LastLoginLocation = context.LastLoginLocation,
            LastLoginDevice = context.LastLoginDevice,
            TrustedDevicesJson = context.TrustedDevicesJson,
            TrustedLocationsJson = context.TrustedLocationsJson,
            UpdatedAt = context.UpdatedAt
        };

        return Result.Success(dto);
    }
}
