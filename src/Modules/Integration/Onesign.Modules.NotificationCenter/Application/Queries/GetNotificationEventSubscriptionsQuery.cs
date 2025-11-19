using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetNotificationEventSubscriptionsQuery : IRequest<Result<List<NotificationEventSubscriptionDto>>>
{
    public Guid TenantId { get; set; }
    public string? EventType { get; set; }
}
