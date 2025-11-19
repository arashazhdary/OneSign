using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<List<NotificationDto>>>
{
    private readonly INotificationOutboxRepository _repository;

    public GetNotificationsQueryHandler(INotificationOutboxRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = request.UserId.HasValue
            ? await _repository.GetByRecipientAsync(request.TenantId, request.UserId.Value, cancellationToken)
            : new List<Domain.Entities.NotificationOutboxItem>();

        var dtos = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Channel = n.Channel.ToString(),
            RecipientAddress = n.RecipientAddress,
            Subject = n.Subject,
            Body = n.Body,
            Status = n.Status.ToString(),
            CreatedAt = n.CreatedAt,
            SentAt = n.SentAt
        }).ToList();

        return Result.Success(dtos);
    }
}
