using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetNotificationChannelConfigQueryHandler : IRequestHandler<GetNotificationChannelConfigQuery, Result<List<NotificationChannelConfigDto>>>
{
    private readonly INotificationChannelConfigRepository _repository;

    public GetNotificationChannelConfigQueryHandler(INotificationChannelConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<NotificationChannelConfigDto>>> Handle(GetNotificationChannelConfigQuery request, CancellationToken cancellationToken)
    {
        var configs = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (!string.IsNullOrEmpty(request.Channel) && Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
        {
            configs = configs.Where(c => c.Channel == channel).ToList();
        }

        var dtos = configs.Select(config => new NotificationChannelConfigDto
        {
            Id = config.Id,
            TenantId = config.TenantId,
            Channel = config.Channel.ToString(),
            IsEnabled = config.IsEnabled,
            ConfigurationJson = config.ConfigurationJson,
            CreatedAt = config.CreatedAt,
            UpdatedAt = config.UpdatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
