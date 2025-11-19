using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class CreateNotificationChannelConfigCommand : IRequest<Result<NotificationChannelConfigDto>>
{
    public Guid TenantId { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string ConfigurationJson { get; set; } = "{}";
    public bool IsEnabled { get; set; } = true;
}
