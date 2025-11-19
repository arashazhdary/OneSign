using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class CreateNotificationChannelConfigCommandHandler : IRequestHandler<CreateNotificationChannelConfigCommand, Result<NotificationChannelConfigDto>>
{
    private readonly INotificationChannelConfigRepository _repository;

    public CreateNotificationChannelConfigCommandHandler(INotificationChannelConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotificationChannelConfigDto>> Handle(CreateNotificationChannelConfigCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
            return Result.Failure<NotificationChannelConfigDto>("InvalidChannel", "Invalid notification channel");

        var existing = await _repository.GetByChannelAsync(request.TenantId, channel, cancellationToken);
        if (existing != null)
            return Result.Failure<NotificationChannelConfigDto>("AlreadyExists", "Channel configuration already exists for this tenant");

        var config = new NotificationChannelConfig
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Channel = channel,
            ConfigurationJson = request.ConfigurationJson,
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(config, cancellationToken);

        var dto = new NotificationChannelConfigDto
        {
            Id = config.Id,
            TenantId = config.TenantId,
            Channel = config.Channel.ToString(),
            IsEnabled = config.IsEnabled,
            ConfigurationJson = config.ConfigurationJson,
            CreatedAt = config.CreatedAt
        };

        return Result.Success(dto);
    }
}
