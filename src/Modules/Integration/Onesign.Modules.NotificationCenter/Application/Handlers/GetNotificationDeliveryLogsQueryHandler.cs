using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetNotificationDeliveryLogsQueryHandler : IRequestHandler<GetNotificationDeliveryLogsQuery, Result<PagedResult<NotificationDeliveryLogDto>>>
{
    private readonly INotificationDeliveryLogRepository _logRepository;
    private readonly INotificationOutboxRepository _outboxRepository;

    public GetNotificationDeliveryLogsQueryHandler(
        INotificationDeliveryLogRepository logRepository,
        INotificationOutboxRepository outboxRepository)
    {
        _logRepository = logRepository;
        _outboxRepository = outboxRepository;
    }

    public async Task<Result<PagedResult<NotificationDeliveryLogDto>>> Handle(GetNotificationDeliveryLogsQuery request, CancellationToken cancellationToken)
    {
        NotificationChannel? channel = null;
        if (!string.IsNullOrEmpty(request.Channel) && Enum.TryParse<NotificationChannel>(request.Channel, true, out var parsedChannel))
            channel = parsedChannel;

        DeliveryStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<DeliveryStatus>(request.Status, true, out var parsedStatus))
            status = parsedStatus;

        var skip = (request.Page - 1) * request.PageSize;
        var logs = await _logRepository.GetFilteredAsync(
            request.TenantId,
            channel,
            status,
            request.FromDate,
            request.ToDate,
            skip,
            request.PageSize,
            cancellationToken);

        var totalCount = await _logRepository.GetCountAsync(
            request.TenantId,
            channel,
            status,
            request.FromDate,
            request.ToDate,
            cancellationToken);

        var dtos = new List<NotificationDeliveryLogDto>();
        foreach (var log in logs)
        {
            var outbox = log.OutboxItem ?? await _outboxRepository.GetByIdAsync(log.OutboxItemId, cancellationToken);
            dtos.Add(new NotificationDeliveryLogDto
            {
                Id = log.Id,
                TenantId = log.TenantId,
                OutboxItemId = log.OutboxItemId,
                Channel = log.Channel.ToString(),
                Status = log.Status.ToString(),
                ProviderMessageId = log.ProviderMessageId,
                ErrorDetails = log.ErrorDetails,
                Timestamp = log.Timestamp,
                Subject = outbox?.Subject,
                RecipientAddress = outbox?.RecipientAddress
            });
        }

        var pagedResult = new PagedResult<NotificationDeliveryLogDto>(dtos, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedResult);
    }
}
