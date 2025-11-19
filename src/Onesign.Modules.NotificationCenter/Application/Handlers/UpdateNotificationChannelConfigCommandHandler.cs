using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class UpdateNotificationChannelConfigCommandHandler : IRequestHandler<UpdateNotificationChannelConfigCommand, Result<NotificationChannelConfigDto>>
{
    private readonly INotificationChannelConfigRepository _repository;

    public UpdateNotificationChannelConfigCommandHandler(INotificationChannelConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotificationChannelConfigDto>> Handle(UpdateNotificationChannelConfigCommand request, CancellationToken cancellationToken)
    {
        var config = await _repository.GetByIdAsync(request.ConfigId, cancellationToken);
        if (config == null || config.TenantId != request.TenantId)
            return Result.Failure<NotificationChannelConfigDto>("NotFound", "Channel configuration not found");

        if (request.ConfigurationJson != null)
            config.ConfigurationJson = request.ConfigurationJson;
        if (request.IsEnabled.HasValue)
            config.IsEnabled = request.IsEnabled.Value;

        config.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(config, cancellationToken);

        var dto = new NotificationChannelConfigDto
        {
            Id = config.Id,
            TenantId = config.TenantId,
            Channel = config.Channel.ToString(),
            IsEnabled = config.IsEnabled,
            ConfigurationJson = config.ConfigurationJson,
            CreatedAt = config.CreatedAt,
            UpdatedAt = config.UpdatedAt
        };

        return Result.Success(dto);
    }
}
