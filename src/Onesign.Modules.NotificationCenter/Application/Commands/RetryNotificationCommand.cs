using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class RetryNotificationCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid NotificationId { get; set; }
}
