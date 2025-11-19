using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class UpdateNotificationEventSubscriptionCommand : IRequest<Result<NotificationEventSubscriptionDto>>
{
    public Guid TenantId { get; set; }
    public Guid SubscriptionId { get; set; }
    public Guid? TemplateId { get; set; }
    public string? RecipientSelector { get; set; }
    public bool? IsEnabled { get; set; }
}
