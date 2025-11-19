using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class CreateNotificationEventSubscriptionCommand : IRequest<Result<NotificationEventSubscriptionDto>>
{
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public Guid TemplateId { get; set; }
    public string RecipientSelector { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}
