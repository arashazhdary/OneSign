using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Commands;

public class UpdateNotificationChannelConfigCommand : IRequest<Result<NotificationChannelConfigDto>>
{
    public Guid TenantId { get; set; }
    public Guid ConfigId { get; set; }
    public string? ConfigurationJson { get; set; }
    public bool? IsEnabled { get; set; }
}
