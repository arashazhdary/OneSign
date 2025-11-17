using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class SendNotificationCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string RecipientAddress { get; set; } = string.Empty;
    public Guid? RecipientUserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
}
